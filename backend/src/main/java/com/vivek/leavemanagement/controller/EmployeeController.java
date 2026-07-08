package com.vivek.leavemanagement.controller;

import com.vivek.leavemanagement.dto.EmployeeRequestDTO;
import com.vivek.leavemanagement.entity.Employee;
import com.vivek.leavemanagement.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody EmployeeRequestDTO dto) {
        Employee employee = employeeService.createEmployee(dto);
        return new ResponseEntity<>(employee, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employee);
    }

    @GetMapping("/{id}/leave-balance")
    public ResponseEntity<Map<String, Object>> getEmployeeLeaveBalance(@PathVariable Long id) {
        Integer balance = employeeService.getEmployeeLeaveBalance(id);
        Map<String, Object> response = new HashMap<>();
        response.put("employeeId", id);
        response.put("leaveBalance", balance);
        return ResponseEntity.ok(response);
    }
}
