<template>
    <div class="gantt" ref="Gantt" @scroll="GanttScroll">
        <!-- 时间线 -->
        <div class="timeLineBox">
            <div class="leftTopType">xxxx</div>
            <div class="timeLine">
                <div ref="timeLengthBox" :style="timeLineStyle" class="timeLengthBox">
                    <p class="hover" v-for="(item, index) in timeLineArr" :key="index" :style="{ width: hourWidht + 'px' }">
                        {{ item }}
                    </p>
                </div>
            </div>
        </div>
        <!-- 甘特图内容 -->
        <div class="ganttContentBox">
            <!-- 机型列表 -->
            <div class="leftAcReg" :style="leftAcRegStyle">
                <div class="acTypeList" v-for="(item, index) in flightData" :key="index">
                    <div class="acType">{{ item.acType }}</div>
                    <div class="acReg">
                        <p v-for="(flight, _index) in item.rows" :key="_index" :style="{ height: flight.overlapNum * 30 + 'px', lineHeight: flight.overlapNum * 30 + 'px' }">
                            {{ flight.acReg }}
                        </p>
                    </div>
                </div>
            </div>
            <!-- 内容 -->
            <div class="ganttItemBoxWrap" ref="ganttItemBoxWrap" @scroll="GanttScroll($event)">
                <div ref="ganttItemBox" class="ganttItemBox" id="ganttItemBox">
                    <div class="ganttList">
                        <div v-for="(item, index) in ganttList" :key="index" :style="{ height: item.overlapNum * 30 + 'px' }">
                            <div class="acRegRow" :id="'acRegRow_' + item.acReg" @mouseup="mouseUp($event, item.acReg)" @mouseenter="mouseenter($event, index)">
                                <!-- 每个甘特条 -->
                                <GanttView
                                    :initDate="initDateTime"
                                    :hourWidht="hourWidht"
                                    v-for="(flight, _index) in item.flights"
                                    :key="_index"
                                    :flightDetail="flight"
                                ></GanttView>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from "./mixin.js";
import JSON from "./json";
import GanttView from "./ganttView.vue";
export default {
    name: "HelloWorld",
    mixins: [mixin],
    components: {
        GanttView,
    },

    data() {
        return {
            currentWindowWidth: 0,
            flightData: [], //请求获取来的数据
            ganttList: [], // 甘特条数据
            // 时间线样式
            timeLineStyle: {
                position: "relative",
                left: 0,
                width: 0,
            },
            // 机号列表样式
            leftAcRegStyle: {
                position: "relative",
                top: 0,
            },
            // 初始化最左侧时间
            initDateTime: 0,
            //  当前机型机号对象
            acTypeObj: {},
            // 当前机号列表
            acRegList: [],
            // 时间轴相关
            timeLineArr: [],
            timeRange: 24, //一屏显示的小时数
            initHours: 48, // 要展示的小时数，初始化展示48小时
        };
    },
    computed: {
        hourWidht() {
            // 默认屏幕24小时
            let width = this.currentWindowWidth / this.timeRange;
            return width;
        },
    },
    methods: {
        // 获取当前时间轴
        getCurrentTime() {
            let arr = [];
            const now = new Date();
            const before24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            this.initDateTime = new Date(this.$dayjs(before24Hours).format("YYYY-MM-DD HH:00")).getTime();
            for (let i = 0; i < 24; i++) {
                const hour = Math.floor(before24Hours.getHours());
                arr.push(hour);
                before24Hours.setHours(before24Hours.getHours() + 1);
            }
            for (let i = 0; i < 24; i++) {
                let time = new Date().getTime() + i * 1000 * 60 * 60;
                let after24Hours = Math.floor(new Date(time).getHours());
                arr.push(after24Hours);
            }
            this.timeLineArr = arr;
        },
        // 获取机型机号列表和甘特图
        getAcTypeAndAcRegList() {
            this.ganttList = [];
            let data = this.flightData;
            data.forEach((item) => {
                item.rows.forEach((ele) => {
                    this.ganttList.push(ele);
                });
            });
            this.calcAcRegOverlap();
        },
        //  计算每个甘特条的位置
        calcGanttItemPosition() {},

        // 计算每个机号是否重叠，重叠了多少层
        calcAcRegOverlap() {
            // 设置开始和结束时间
            function genttViewPositionValue(flight) {
                let startTime = flight.atd || flight.etd || flight.std || flight.ptd;
                let endTime = flight.ata || flight.eta || flight.sta || flight.pta;
                return {
                    startTime: new Date(startTime).getTime(),
                    endTime: new Date(endTime).getTime(),
                };
            }
            // 重叠判断
            function overlapHandle(list, item) {
                let arr = [];
                for (let i = 0; i < list.length; i++) {
                    // 后一个元素存在，并且后一个元素的开始时间小于前一个的结束时间（说明重叠，标志置为true），后一个元素向下移动 30个 像素；
                    if (list[i + 1] && list[i].positionValue.endTime > list[i + 1].positionValue.startTime) {
                        item.isOverlapFloag = true; // 是否有重叠标志 --- 有
                        list[i + 1].positionValue.endTime = list[i].positionValue.endTime;
                        list[i + 1].positionValue.top ? (list[i + 1].positionValue.top += 30) : (list[i + 1].positionValue.top = 30);
                        list[i + 1].positionValue.level = item.overlapNum + 1; // 当前是第几层
                        arr.push(list[i + 1]);
                    }
                }
                if (arr.length) {
                    item.overlapNum += 1;
                    overlapHandle(arr, item);
                }
            }

            this.ganttList.forEach((item) => {
                item.isOverlapFloag = false; // 是否有重叠的标准 --- 没有
                item.overlapNum = 1;
                item.flights.forEach((flight) => {
                    let data = genttViewPositionValue(flight);
                    flight.positionValue = {};
                    flight.positionValue.startTime = data.startTime;
                    flight.positionValue.endTime = data.endTime;
                    flight.positionValue.level = 1; // 当前是第几层
                });
                // 排序
                item.flights = item.flights.sort((a, b) => a.positionValue.startTime - b.positionValue.startTime);
                overlapHandle(item.flights, item);
            });
        },
    },
    mounted() {
        // 获取当前屏幕宽度
        this.currentWindowWidth = document.body.clientWidth - 100;
        this.timeLineStyle.width = this.initHours * this.hourWidht + "px";
        this.$refs.ganttItemBox.style.width = this.initHours * this.hourWidht + "px";
        // 屏幕变化改变每个小时的宽度
        window.onresize = () => {
            this.currentWindowWidth = document.body.clientWidth - 100;
            this.timeLineStyle.width = this.initHours * this.hourWidht + "px";
            this.$refs.ganttItemBox.style.width = this.initHours * this.hourWidht + "px";
        };
        this.getCurrentTime();
        this.flightData = JSON.flightList;
        this.getAcTypeAndAcRegList();
    },
};
</script>

<style scoped lang="scss">
.gantt {
    height: 100%;
    width: 100%;
    overflow: hidden;
    user-select: none;
    .timeLineBox {
        height: 60px;
        background: #ddd;
        display: flex;
        .leftTopType {
            width: 100px;
            height: 60px;
            position: relative;
            z-index: 100;
            background: #ddd;
        }
        .timeLine {
            height: 100%;
            width: calc(100% - 100px);
            .timeLengthBox {
                height: 100%;
                position: relative;
                p {
                    display: inline-block;
                    height: 100%;
                    width: 30px;
                    line-height: 30px;
                    box-sizing: border-box;
                    border-right: 1px solid #333;
                }
            }
        }
    }
    .ganttContentBox {
        height: calc(100% - 60px);
        // 机型机号列表
        .leftAcReg {
            width: 100px;
            background: #ddd;
            float: left;
            .acTypeList {
                display: flex;
                justify-content: space-between;
                .acReg {
                    p {
                        line-height: 30px;
                        border-bottom: 1px solid #333;
                    }
                }
            }
        }
        // 甘特图内容
        .ganttItemBoxWrap {
            width: calc(100% - 100px);
            height: 100%;
            overflow: auto;
            .ganttItemBox {
                .ganttList {
                    width: 100%;
                    height: 100%;
                    > div {
                        height: 30px;
                        line-height: 30px;
                        width: 100%;
                        border-bottom: 1px solid #ddd;
                        overflow: hidden;
                        .acRegRow {
                            width: 100%;
                            height: 100%;
                            position: relative;
                            .timeCell {
                                width: 30px;
                                height: 100%;
                                line-height: 30px;
                                float: left;
                            }
                            .flightItem {
                                height: 30px;
                                width: 200px;
                                background: #3e93f5;
                                position: absolute;
                                left: 200px;
                                top: 5px;
                                &:hover {
                                    cursor: move;
                                }
                            }
                            .flightItem2 {
                                height: 30px;
                                width: 200px;
                                background: #3e93f5;
                                position: absolute;
                                left: 500px;
                                top: 5px;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
