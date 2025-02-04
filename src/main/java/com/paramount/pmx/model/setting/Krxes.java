package com.paramount.pmx.model.setting;


import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "KRXES")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"id"})
@EqualsAndHashCode(of = {})
public class Krxes implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "id")
    private Long id;                    //krx ID
    private String name;                //krx 이름
    private String code;                //krx 코드
    private String kindof;              //krx 종류 (kosdaq, konex, kospi)

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;                //작성일자

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;                //수정일자

    /**
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "krxes" )
    private List<Krxes> krxesList = new ArrayList<>();
    */

    @Builder
    public Krxes(
            Long id,
            String name,
            String code,
            String kindof

    ) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.kindof = kindof;
    }

}
