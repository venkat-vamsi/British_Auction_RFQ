package com.rfq.british.controller;

import com.rfq.british.dto.request.CreateRfqRequest;
import com.rfq.british.dto.response.RfqDetailResponse;
import com.rfq.british.dto.response.RfqSummaryResponse;
import com.rfq.british.repository.UserRepository;
import com.rfq.british.service.RfqService;
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
public class RfqController {

    private final RfqService rfqService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<RfqSummaryResponse>> listRfqs() {
        return ResponseEntity.ok(rfqService.listRfqs());
    }

    @PostMapping
    public ResponseEntity<RfqDetailResponse> createRfq(
            @Valid @RequestBody CreateRfqRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long buyerId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow().getId();
        RfqDetailResponse response = rfqService.createRfq(request, buyerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RfqDetailResponse> getRfqDetail(@PathVariable Long id) {
        return ResponseEntity.ok(rfqService.getRfqDetail(id));
    }
}
