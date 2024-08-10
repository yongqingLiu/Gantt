<template>
    <div
        class="ganttItemView"
        :id="'flight_' + flightDetail.id || flightDetail.id"
        :style="{
            width: genttViewPositionValue.widht,
            left: genttViewPositionValue.left,
            top: flightDetail.positionValue.level === 1 ? '5px' : (flightDetail.positionValue.level - 1) * currentHeight + 'px',
        }"
    >
        <!-- <label>ZBAA</label> -->
        <div
            @click="clickGanttItem"
            :class="[
                'ganttItem',
                flightDetail.waitingStatus === 'MAINTAIN' ? 'overhaulFlag' : '',// 检修
                flightDetail.isHeightLight ? 'selectGanttItem' : '',
                flightDetail.isChange ? 'isChange' : '',
            ]"
            :flightid="flightDetail.id"
            :style="{ height: currentGantItemtHeight + 'px', lineHeight: currentGantItemtHeight + 'px', fontSize: currentGantItemtHeight - 4 + 'px' }"
        >
            {{ flightDetail.flightNo }}
        </div>
        <!-- <label>ZSPD</label> -->
    </div>
</template>
<script>
export default {
    props: {
        initDate: Number,
        hourWidht: Number,
        flightDetail: Object,
        positionValue: Object,
        currentHeight: Number,
    },
    computed: {
        currentGantItemtHeight() {
            return this.currentHeight - 12;
        },
        genttViewPositionValue() {
            let width = 0;
            let left = 0;
            let startTime = this.flightDetail.atd || this.flightDetail.etd || this.flightDetail.std || this.flightDetail.ptd || this.flightDetail.depTime;
            let endTime = this.flightDetail.ata || this.flightDetail.eta || this.flightDetail.sta || this.flightDetail.pta || this.flightDetail.arrTime;
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
    position: absolute;
    z-index: 9;
    > label {
        line-height: 20px;
        position: absolute;
        display: inline-block;
        height: 20px;
    }
    > label:nth-of-type(1) {
        left: 0;
        transform: translateX(-100%);
    }
    > label:nth-of-type(2) {
        top: 0;
        right: 0;

        transform: translateX(100%);
    }
   
}
</style>
