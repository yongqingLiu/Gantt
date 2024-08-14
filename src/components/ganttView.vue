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
        <label :style="ganttItemStyle">{{ flightDetail.depAirportCnShort ? flightDetail.depAirportCnShort : flightDetail.departureAirport }}</label>
        <div
            @click="clickGanttItem"
            :class="[
                'ganttItem',
                flightDetail.waitingStatus === 'MAINTAIN' ? 'overhaulFlag' : '', // 检修
                flightDetail.isHeightLight ? 'selectGanttItem' : '',
                flightDetail.isChange ? 'isChange' : '',
                flightStatusClassName,
                flightCancelFlag,
            ]"
            :flightid="flightDetail.id"
            :style="ganttItemStyle"
        >
            {{ flightDetail.flightNo }}
            <div class="flagIconBox" :style="ganttItemFontSizeStyle">
                <!-- 新机长 -->
                <span v-if="flightDetail.newCaptainFlag === 'Y' && checkListProp.indexOf('newCaptainFlag') !== -1" class="iconName newCaptainFlagClass"></span>
                <!-- 是否换机组 -->
                <span
                    v-if="flightDetail.crewChangeFlag === 'Y' && checkListProp.indexOf('crewChgFlag') !== -1 && isNotZSNJ(flightDetail)"
                    class="iconName ischangeCrewClass"
                ></span>
                <!-- 超出人数 -->
                <span v-if="flightDetail.seatingWarnFlag === 'Y' && checkListProp.indexOf('seatingWarnFlag') !== -1" class="iconName exceedPersonFlag"></span>
                <!-- 航班备注 -->
                <span v-if="flightDetail.remarkFlag === 'Y' && checkListProp.indexOf('remarkFlag') !== -1" class="iconName remarkFlagClass"></span>
                <!-- 外籍标志 -->
                <span v-if="flightDetail.foreignFlag === 'Y' && checkListProp.indexOf('foreignFlag') !== -1" class="iconName foreignFlagClass"></span>
                <!-- 是否备降航班 1 -->
                <span v-if="flightDetail.altFlightFlag === 'Y' && checkListProp.indexOf('altFlightFlag') !== -1" class="iconName altFlightFlagClass"></span>
                <!-- 是否备降航班 2 -->
                <span v-if="flightDetail.altFlightFlag2 === 'Y' && checkListProp.indexOf('altFlightFlag2') !== -1" class="iconName altFlightFlagClass2"></span>
                <!-- 是否重要航班 -->
                <span v-if="flightDetail.importantFlag === 'Y' && checkListProp.indexOf('importantFlag') !== -1" class="iconName importantFlight"></span>
                <!-- 已放行 && EFB未签收 (按照签名来说)-->
                <span
                    v-if="flightDetail.releaseFlag === 'Y' && flightDetail.crewReceived !== 'Y' && checkListProp.indexOf('releaseFlag') !== -1"
                    class="iconName captainDownloadClass"
                >
                    <i class="iconName el-icon-star-off"></i>
                </span>
                <!-- 已放行 && 已签收 (按照签名来说)-->
                <span v-if="flightDetail.crewReceived === 'Y' && checkListProp.indexOf('crewReceived') !== -1" class="iconName releaseFlagClass">
                    <i class="iconName el-icon-star-on"></i>
                </span>
            </div>
            <!-- 流量时间相比 是否延误 CTD -->
            <span :style="ganttItemDelayStyle" v-if="flightDetail.flgDelayThreshold === 'Y'" class="iconName CTDTimeDelay"></span>
            <!-- 是否有飞行员执勤时间超出 -->
            <span :style="ganttItemDelayStyle" v-if="flightDetail.flyTimeWarnFlag === 1" class="iconName exceedTime"></span>
        </div>
        <label :style="ganttItemStyle">{{ flightDetail.arrAirportCnShort ? flightDetail.arrAirportCnShort : flightDetail.arrivalAirport }}</label>
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
        ganttItemStyle() {
            return {
                height: this.currentGantItemtHeight + "px",
                lineHeight: this.currentGantItemtHeight + "px",
                fontSize: this.currentGantItemtHeight - 4 + "px",
            };
        },
        ganttItemFontSizeStyle() {
            return {
                fontSize: this.currentGantItemtHeight - 7 + "px",
            };
        },
        ganttItemDelayStyle() {
            return {
                display: "block",
                height: this.currentGantItemtHeight + "px",
                width: this.currentGantItemtHeight + "px",
            };
        },
        flightStatusClassName() {
            let className = "flightStatus_" + this.flightDetail.waitingStatus;
            return className;
        },
        flightCancelFlag() {
            let className = this.flightDetail.flgCs === "Y" ? "flightStatus_cancel" : "";
            return className;
        },
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

        // 甘特图图标显示
        checkListProp() {
            // return this.$store.state.checkListProp;
            return [
                "newCaptainFlag",
                "releaseFlag",
                "foreignFlag",
                "seatingWarnFlag",
                "remarkFlag",
                "crewReceived",
                "altFlightFlag",
                "altFlightFlag2",
                "importantFlag",
                "crewChgFlag",
            ];
        },
    },
    data() {
        return {};
    },
    methods: {
        clickGanttItem(event) {
            this.$emit("clickGanttItem", event);
        },
        isNotZSNJ(data) {
            return data.arrivalAirport !== "ZSNJ" && data.departureAirport !== "ZSNJ";
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
    font-weight: bold;
    > label {
        line-height: 20px;
        position: absolute;
        display: inline-block;
        height: 20px;
        font-size: 14px;
        padding: 0 2px;
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
    .flagIconBox {
        position: relative;
        bottom: 10px; //甘特条高度 (行高)
        width: 100%;
        line-height: 16px;
        white-space: nowrap;
        display: flex;
        justify-content: space-around;
        span {
            display: inline-block;
        }
        span:before {
            border-radius: 50%;
            padding: 1px;
            background: rgba(51, 51, 51, 0.7);
            text-align: center;
            color: #fff;
        }
        // 新机长
        .newCaptainFlagClass:before {
            content: "新";
            background-color: #fd4b4f;
        }
        // 换机组
        .ischangeCrewClass:before {
            content: "H";
            padding: 0 2px;
            text-align: center;
            background-color: rgba(255, 166, 0, 0.664);
        }
        // 人数超了
        .exceedPersonFlag:before {
            content: "超";
            background-color: #fd4b4f;
        }
        // 备注
        .remarkFlagClass:before {
            content: "注";
            background: #940395;
        }
        // 是否外籍机长
        .foreignFlagClass:before {
            content: "外";
            background-color: #fd4b4f;
        }
        // 备降航班1
        .altFlightFlagClass:before {
            content: "备1";
            background-color: #fd4b4f;
        }
        // 备降航班2
        .altFlightFlagClass2:before {
            content: "备2";
            background-color: #fd4b4f;
        }
        // 重要航班
        .importantFlight:before {
            content: "!";
            display: inline-block;
            width: 14px;
            transform: scale(0.8);
        }
        //已放行未签收
        .captainDownloadClass,
        .releaseFlagClass {
            color: #000;
            opacity: 0.8;
            font-size: 16px;
            margin-top: -2px;
        }
        //已放行已签收
        .releaseFlagClass {
            font-size: 18px;
            color: #04a180;
        }
    }
    // CTD延误
    .CTDTimeDelay {
        position: absolute;
        top: 0;
        right: 0;
        background: linear-gradient(to top right, transparent 50%, orange 50%);
    }
    // 是否有飞行员执勤时间超出
    .exceedTime {
        position: absolute;
        top: 0;
        left: 0;
        background: linear-gradient(to left top, transparent 50%, #fd4b4f 50%);
    }
}
</style>
