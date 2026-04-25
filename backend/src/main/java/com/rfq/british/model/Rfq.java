package com.rfq.british.model;

import com.rfq.british.enums.AuctionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rfqs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Rfq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rfq_name", nullable = false, length = 200)
    private String rfqName;

    @Column(name = "reference_id", nullable = false, unique = true, length = 50)
    private String referenceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "bid_start_time", nullable = false)
    private LocalDateTime bidStartTime;

    @Column(name = "bid_close_time", nullable = false)
    private LocalDateTime bidCloseTime;

    @Column(name = "forced_close_time", nullable = false)
    private LocalDateTime forcedCloseTime;

    @Column(name = "pickup_service_date", nullable = false)
    private LocalDate pickupServiceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus status;

    @OneToOne(mappedBy = "rfq", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AuctionConfig auctionConfig;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = AuctionStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
