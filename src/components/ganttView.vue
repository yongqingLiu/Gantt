<template>
    <div
        class="ganttView"
        :style="{
            width: genttViewPositionValue.widht,
            left: genttViewPositionValue.left,
            top: flightDetail.positionValue.level===1?'5px':flightDetail.positionValue.top+'px',
        }"
    >
        <div class="content item" :flightid="flightDetail.id">
          {{ flightDetail.flightNo }}
        </div>
    </div>
</template>
<script>
export default {
    props: {
        initDate: Number,
        hourWidht: Number,
        flightDetail: Object,
        positionValue: Object,
    },

    computed: {
        genttViewPositionValue() {
            let width = 0;
            let left = 0;
            let startTime =
                this.flightDetail.atd ||
                this.flightDetail.etd ||
                this.flightDetail.std ||
                this.flightDetail.ptd;
            let endTime =
                this.flightDetail.ata ||
                this.flightDetail.eta ||
                this.flightDetail.sta ||
                this.flightDetail.pta;
            width =
                ((new Date(endTime).getTime() - new Date(startTime).getTime()) /
                    1000 /
                    60 /
                    60) *
                this.hourWidht;
               
            left =
                ((new Date(startTime).getTime() - this.initDate) /
                    1000 /
                    60 /
                    60) *
                this.hourWidht;
            return {
                widht: width + "px",
                left: left + "px",
            };
        },
    },
    data() {
        return {};
    },
    mounted() {
        // console.log(this.flightDetail);
    },
};
</script>
<style lang="scss" scoped>
.ganttView {
    position: absolute;
    .content {
        background: #22a3fe;
        height: 20px;
        line-height: 20px;
        text-align: center;
        font-size: 14px;
        cursor: move;
    }
}
</style>
