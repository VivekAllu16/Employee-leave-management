package com.vivek.leavemanagement.service;

import com.vivek.leavemanagement.dto.EmployeeRequestDTO;
import com.vivek.leavemanagement.entity.Employee;

import java.util.List;

public interface EmployeeService {
    Employee createEmployee(EmployeeRequestDTO dto);
    List<Employee> getAllEmployees();
    Employee getEmployeeById(Long id);
    Integer getEmployeeLeaveBalance(Long id);
}
