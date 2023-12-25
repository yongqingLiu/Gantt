<template>
    <div class="ganttItemView">
        <div
            @click="clickGanttItem"
            class="ganttItem"
            :flightid="flightDetail.id"
            :style="{
                width: genttViewPositionValue.widht,
                left: genttViewPositionValue.left,
                top: flightDetail.positionValue.level === 1 ? '5px' : flightDetail.positionValue.top + 'px',
            }"
        >
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
            let startTime = this.flightDetail.atd || this.flightDetail.etd || this.flightDetail.std || this.flightDetail.ptd;
            let endTime = this.flightDetail.ata || this.flightDetail.eta || this.flightDetail.sta || this.flightDetail.pta;
            width = ((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60 / 60) * this.hourWidht;

            left = ((new Date(startTime).getTime() - this.initDate) / 1000 / 60 / 60) * this.hourWidht;
            return {
                widht: width + "px",
                left: left + "px",
            };
        },
    },
    data() {
        return {};
    },
    methods: {
        clickGanttItem(event) {
            this.$emit("clickGanttItem", event);
        },
    },
    mounted() {
        // console.log(this.flightDetail);
    },
};
</script>
<style lang="scss" scoped>
.ganttItemView {
    .ganttItem {
    position: absolute;
        background: #22a3fe;
        height: 20px;
        line-height: 20px;
        text-align: center;
        font-size: 14px;
        cursor: move;
    }
    .selectGanttItem {
        border: 4px solid red;
        height: 12px;
        line-height: 12px;
    }
}
</style>
