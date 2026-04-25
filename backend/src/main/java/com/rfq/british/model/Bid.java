package com.rfq.british.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private Rfq rfq;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private User supplier;

    @Column(name = "carrier_name", nullable = false, length = 150)
    private String carrierName;

    @Column(name = "freight_charges", nullable = false, precision = 15, scale = 2)
    private BigDecimal freightCharges;

    @Column(name = "origin_charges", nullable = false, precision = 15, scale = 2)
    private BigDecimal originCharges;

    @Column(name = "destination_charges", nullable = false, precision = 15, scale = 2)
    private BigDecimal destinationCharges;

    @Column(name = "total_charges", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalCharges;

    @Column(name = "transit_time_days", nullable = false)
    private Integer transitTimeDays;

    @Column(name = "quote_validity_date", nullable = false)
    private LocalDate quoteValidityDate;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
