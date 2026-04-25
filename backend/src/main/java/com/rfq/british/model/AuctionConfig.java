package com.rfq.british.model;

import com.rfq.british.enums.ExtensionTrigger;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "auction_configs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuctionConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false, unique = true)
    private Rfq rfq;

    @Column(name = "trigger_window_minutes", nullable = false)
    private Integer triggerWindowMinutes;

    @Column(name = "extension_duration_minutes", nullable = false)
    private Integer extensionDurationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "extension_trigger", nullable = false)
    private ExtensionTrigger extensionTrigger;
}
