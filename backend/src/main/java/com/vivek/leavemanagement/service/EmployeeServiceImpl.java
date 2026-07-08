package com.vivek.leavemanagement.service;

import com.vivek.leavemanagement.dto.EmployeeRequestDTO;
import com.vivek.leavemanagement.entity.Employee;
import com.vivek.leavemanagement.exception.ResourceNotFoundException;
import com.vivek.leavemanagement.exception.InvalidLeaveRequestException;
import com.vivek.leavemanagement.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Autowired
    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public Employee createEmployee(EmployeeRequestDTO dto) {
        // Validate unique email
        if (employeeRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new InvalidLeaveRequestException("An employee with email " + dto.getEmail() + " already exists.");
        }
        
        Employee employee = new Employee();
        employee.setName(dto.getName());
        employee.setEmail(dto.getEmail());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setLeaveBalance(dto.getLeaveBalance() != null ? dto.getLeaveBalance() : 20);
        
        return employeeRepository.save(employee);
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    @Override
    public Integer getEmployeeLeaveBalance(Long id) {
        Employee employee = getEmployeeById(id);
        return employee.getLeaveBalance();
    }
}
