<template>
    <div
        class="ganttItemView"
        :style="{
            width: genttViewPositionValue.widht,
            left: genttViewPositionValue.left,
            top: flightDetail.positionValue.level === 1 ? '5px' : flightDetail.positionValue.top + 'px',
        }"
    >
        <!-- <label>ZBAA</label> -->
        <div @click="clickGanttItem" class="ganttItem" :flightid="flightDetail.id">
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
    position: absolute;
    .ganttItem {
        background: #22a3fe;
        height: 20px;
        line-height: 20px;
        text-align: center;
        font-size: 14px;
        cursor: move;
    }
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
    .selectGanttItem {
        border: 4px solid red;
        height: 12px;
        line-height: 12px;
    }
}
</style>
