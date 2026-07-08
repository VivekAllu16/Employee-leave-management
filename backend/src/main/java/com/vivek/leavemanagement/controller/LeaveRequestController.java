package com.vivek.leavemanagement.controller;

import com.vivek.leavemanagement.dto.LeaveRequestDTO;
import com.vivek.leavemanagement.dto.LeaveStatusUpdateDTO;
import com.vivek.leavemanagement.entity.LeaveRequest;
import com.vivek.leavemanagement.service.LeaveRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:5173")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @Autowired
    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping("/employee/{employeeId}")
    public ResponseEntity<LeaveRequest> applyLeave(
            @PathVariable Long employeeId,
            @Valid @RequestBody LeaveRequestDTO dto) {
        LeaveRequest leaveRequest = leaveRequestService.applyLeave(employeeId, dto);
        return new ResponseEntity<>(leaveRequest, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests() {
        List<LeaveRequest> requests = leaveRequestService.getAllLeaveRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByEmployee(@PathVariable Long employeeId) {
        List<LeaveRequest> requests = leaveRequestService.getLeaveRequestsByEmployee(employeeId);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{leaveId}/status")
    public ResponseEntity<LeaveRequest> updateLeaveStatus(
            @PathVariable Long leaveId,
            @Valid @RequestBody LeaveStatusUpdateDTO dto) {
        LeaveRequest leaveRequest = leaveRequestService.updateLeaveStatus(leaveId, dto.getStatus());
        return ResponseEntity.ok(leaveRequest);
    }

    @PutMapping("/{leaveId}/cancel")
    public ResponseEntity<LeaveRequest> cancelLeaveRequestPut(@PathVariable Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestService.cancelLeaveRequest(leaveId);
        return ResponseEntity.ok(leaveRequest);
    }

    @DeleteMapping("/{leaveId}")
    public ResponseEntity<LeaveRequest> cancelLeaveRequestDelete(@PathVariable Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestService.cancelLeaveRequest(leaveId);
        return ResponseEntity.ok(leaveRequest);
    }
}
