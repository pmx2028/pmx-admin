package com.paramount.pmx.model.tvcms;


import com.paramount.pmx.model.cms.Users;
import com.paramount.pmx.model.setting.Krxes;
import com.paramount.pmx.model.setting.KrxesDto;
import lombok.*;
import org.springframework.context.annotation.Description;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Description("VOD정보")
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "TV_VODS")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@ToString(exclude = {})
@EqualsAndHashCode(of = {"id"})
public class TvVods implements Serializable {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "PROGRAM_ID")
    private Long programId;

    @Column(name = "PROGRAM_NAME")
    private String programName;

    @Column(name = "VOD_NAME")
    private String vodName;

    @Column(name = "YOUTUBE_URL")
    private String youtubeUrl;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "tvVods", cascade = CascadeType.ALL, orphanRemoval=true )
    private List<TvVodKrxes> tvVodKrxesList = new ArrayList<>();

    // 조인 정보 (user)
    @ManyToOne
    @JoinColumn(name = "created_by" , referencedColumnName = "id" , insertable = false, updatable = false)
    private Users users;

    @Column(name = "KRXE_NAME")
    private String krxeName;

    @Column(name = "FILE_NAME")
    private String fileName;

    @Column(name = "SAVE_FILE_NAME")
    private String saveFileName;

    @Column(name = "FILE_PAHT")
    private String filePath;

    @Column(name = "VIEW_FLAG")
    private String viewFlag;

    @Column(name = "USE_FLAG")
    private String useFlag;

    @Column(name = "HITS_COUNT")
    private Long hitsCount;

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





/**
    // 주문 항목 추가 메서드
    public void addTvVodKrxes(TvVodKrxes tvVodKrxes) {
        this.tvVodKrxesList.add(tvVodKrxes);
        tvVodKrxes.setTv(this);
    }
*/

    //데이터 추가 메소드
    @Builder
    public TvVods (
            Long id,
            Long programId,
            String programName,
            String vodName,
            String youtubeUrl,
            String krxeName,
            String fileName,
            String saveFileName,
            String filePath,
            String viewFlag,
            String useFlag,
            Long createdBy,
            Long updatedBy
    ){
        this.id = id;
        this.programId = programId;
        this.programName = programName;
        this.vodName = vodName;
        this.youtubeUrl = youtubeUrl;
        this.krxeName = krxeName;
        this.fileName = fileName;
        this.saveFileName = saveFileName;
        this.filePath = filePath;
        this.viewFlag = viewFlag;
        this.useFlag = useFlag;
        this.createdBy =createdBy;
    }
    //데이터 수정 메소드
    public TvVods updateTvVods (
            String useFlag,
            Long updatedBy
    ) {
        this.useFlag = useFlag;
        this.updatedBy = updatedBy;
        return this;
    }

    /****************************************************************************
     * 설명 : 종목정보 add
     * Table : TV_VOD_KRXES
     * Model : TvVodKrxes
     ****************************************************************************/

    public void addTvVodKrxes(TvVodKrxes tvVodKrxes) {
        this.tvVodKrxesList.add(tvVodKrxes);
        TvVodKrxes.builder().tvVods(this);
    }

    public void clearTvVodKrxes() {
        this.tvVodKrxesList.clear(); // 컬렉션 초기화
    }

    /****************************************************************************
     * 설명 : 종목정보 add
     * Table : TV_VOD_KRXES
     * Model : TvVodKrxes
     ****************************************************************************/


    public void addTvVodKrxes(List<TvVodKrxesDto> tvVodKrxesDtoList ) {

        List<TvVodKrxes> tvVodKrxesList = new ArrayList<>();
        tvVodKrxesDtoList.stream().forEach(
            r-> {
                tvVodKrxesList.add(
                        TvVodKrxes.builder()
                                .id(r.getId())
                                .krxes(r.getKrxes())
                                .createdBy(r.getCreatedBy())
                                .build()
                    );
                }
        );

        if (this.tvVodKrxesList == null){
            this.tvVodKrxesList = tvVodKrxesList;
        } else { //수정용.
            if (tvVodKrxesList != null){
                this.tvVodKrxesList.clear();
                this.tvVodKrxesList.addAll(tvVodKrxesList);
            }
        }
    }

}
