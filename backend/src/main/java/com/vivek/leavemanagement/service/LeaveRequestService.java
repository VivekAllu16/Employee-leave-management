package com.vivek.leavemanagement.service;

import com.vivek.leavemanagement.dto.LeaveRequestDTO;
import com.vivek.leavemanagement.entity.LeaveRequest;

import java.util.List;

public interface LeaveRequestService {
    LeaveRequest applyLeave(Long employeeId, LeaveRequestDTO dto);
    List<LeaveRequest> getAllLeaveRequests();
    List<LeaveRequest> getLeaveRequestsByEmployee(Long employeeId);
    LeaveRequest updateLeaveStatus(Long leaveId, String status);
    LeaveRequest cancelLeaveRequest(Long leaveId);
}
