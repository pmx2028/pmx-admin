package com.paramount.pmx.model.tvcms;


import com.paramount.pmx.model.setting.Krxes;
import lombok.*;
import org.apache.commons.math3.stat.descriptive.summary.Product;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;
import org.springframework.context.annotation.Description;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Description("VOD종목정보")
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "TV_VOD_KRXES")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@EqualsAndHashCode(of = {"id"})
public class TvVodKrxes implements Serializable {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vod_id", referencedColumnName = "id")
    private TvVods tvVods;

    @ManyToOne
    @JoinColumn(name = "krxe_id", referencedColumnName = "id")
    private Krxes krxes;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "UPDATED_BY")
    private Long updatedBy;

    @Column(name = "CREATED_AT" , updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    //데이터 추가 메소드
    @Builder
    public TvVodKrxes(
            Long id,
            TvVods tvVods,
            Krxes krxes,
            Long createdBy,
            Long updatedBy
    ) {
        this.id = id;
        this.tvVods = tvVods;
        this.krxes = krxes;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }
}
