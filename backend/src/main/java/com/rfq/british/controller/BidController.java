package com.rfq.british.controller;

import com.rfq.british.dto.request.SubmitBidRequest;
import com.rfq.british.dto.response.ActivityLogResponse;
import com.rfq.british.dto.response.BidResponse;
import com.rfq.british.model.ActivityLog;
import com.rfq.british.repository.ActivityLogRepository;
import com.rfq.british.repository.UserRepository;
import com.rfq.british.service.BidService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rfq")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    @PostMapping("/{rfqId}/bids")
    public ResponseEntity<BidResponse> submitBid(
            @PathVariable Long rfqId,
            @Valid @RequestBody SubmitBidRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long supplierId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow().getId();
        BidResponse response = bidService.submitBid(rfqId, request, supplierId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{rfqId}/bids")
    public ResponseEntity<List<BidResponse>> getBids(@PathVariable Long rfqId) {
        return ResponseEntity.ok(bidService.getBidsForRfq(rfqId));
    }

    @GetMapping("/{rfqId}/activity-log")
    public ResponseEntity<List<ActivityLogResponse>> getActivityLog(@PathVariable Long rfqId) {
        List<ActivityLog> logs = activityLogRepository.findByRfqIdOrderByCreatedAtAsc(rfqId);
        List<ActivityLogResponse> response = logs.stream().map(log ->
                ActivityLogResponse.builder()
                        .id(log.getId())
                        .eventType(log.getEventType())
                        .description(log.getDescription())
                        .oldCloseTime(log.getOldCloseTime())
                        .newCloseTime(log.getNewCloseTime())
                        .bidId(log.getBid() != null ? log.getBid().getId() : null)
                        .createdAt(log.getCreatedAt())
                        .build()
        ).toList();
        return ResponseEntity.ok(response);
    }
}
