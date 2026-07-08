package com.vivek.leavemanagement.service;

import com.vivek.leavemanagement.dto.LeaveRequestDTO;
import com.vivek.leavemanagement.entity.Employee;
import com.vivek.leavemanagement.entity.LeaveRequest;
import com.vivek.leavemanagement.exception.ResourceNotFoundException;
import com.vivek.leavemanagement.exception.InvalidLeaveRequestException;
import com.vivek.leavemanagement.repository.EmployeeRepository;
import com.vivek.leavemanagement.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public LeaveRequestServiceImpl(LeaveRequestRepository leaveRequestRepository, EmployeeRepository employeeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public LeaveRequest applyLeave(Long employeeId, LeaveRequestDTO dto) {
        // Fetch employee
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        // Date validation: endDate cannot be before startDate
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new InvalidLeaveRequestException("End date cannot be before start date.");
        }

        // Calculate leave days (inclusive)
        long leaveDays = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        // Check if leave days > leave balance
        if (leaveDays > employee.getLeaveBalance()) {
            throw new InvalidLeaveRequestException("Insufficient leave balance. Requested: " + leaveDays + " days, Available: " + employee.getLeaveBalance() + " days.");
        }

        // Validate leave type
        String type = dto.getLeaveType().toUpperCase();
        if (!type.equals("SICK") && !type.equals("CASUAL") && !type.equals("EARNED")) {
            throw new InvalidLeaveRequestException("Invalid leave type. Allowed: SICK, CASUAL, EARNED.");
        }

        // Create leave request
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(type);
        leaveRequest.setStartDate(dto.getStartDate());
        leaveRequest.setEndDate(dto.getEndDate());
        leaveRequest.setReason(dto.getReason());
        leaveRequest.setStatus("PENDING");
        leaveRequest.setAppliedDate(LocalDate.now());

        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    @Override
    public List<LeaveRequest> getLeaveRequestsByEmployee(Long employeeId) {
        // Check if employee exists
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    @Override
    @Transactional
    public LeaveRequest updateLeaveStatus(Long leaveId, String status) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        String newStatus = status.toUpperCase();
        if (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED")) {
            throw new InvalidLeaveRequestException("Invalid status update. Status can only be updated to APPROVED or REJECTED.");
        }

        if (!leaveRequest.getStatus().equals("PENDING")) {
            throw new InvalidLeaveRequestException("Cannot change status. Leave request is already in " + leaveRequest.getStatus() + " state.");
        }

        Employee employee = leaveRequest.getEmployee();
        long leaveDays = ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;

        if (newStatus.equals("APPROVED")) {
            if (leaveDays > employee.getLeaveBalance()) {
                throw new InvalidLeaveRequestException("Cannot approve leave. Employee's current balance (" + employee.getLeaveBalance() + " days) is less than required (" + leaveDays + " days).");
            }
            // Subtract from employee leave balance
            employee.setLeaveBalance(employee.getLeaveBalance() - (int) leaveDays);
            employeeRepository.save(employee);
        }

        leaveRequest.setStatus(newStatus);
        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveRequest cancelLeaveRequest(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (!leaveRequest.getStatus().equals("PENDING")) {
            throw new InvalidLeaveRequestException("Cannot cancel leave request. Cancellation is only allowed for PENDING requests.");
        }

        leaveRequest.setStatus("CANCELLED");
        return leaveRequestRepository.save(leaveRequest);
    }
}
