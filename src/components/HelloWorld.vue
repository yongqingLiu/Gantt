<template>
    <div class="gantt" ref="Gantt" @scroll="GanttScroll">
        <div class="searchBox">
            <div>高度： <el-slider :min="24" :max="70" v-model="currentHeight" @input="currentHeightChange"></el-slider></div>
            <div>宽度: <el-slider :min="12" :max="72" v-model="currentWidth" @input="currentWidthChange"></el-slider></div>
        </div>
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
        <div class="ganttContentBox" :style="{ height: `calc(100% - 140px - ${waittingGanttContentBoxHeight}px)` }">
            <!-- 机型列表 -->
            <div class="leftAcReg" :style="leftAcRegStyle">
                <div :class="['acTypeList', item.isSticky ? 'sticky' : '']" :style="{ top: setStickyTop(index, item.isSticky) }" v-for="(item, index) in allGanttData" :key="index">
                    <div class="acType">{{ item.acType }}</div>
                    <div class="acReg">
                        <p
                            v-for="(flight, _index) in item.rows"
                            :key="_index"
                            :style="{ lineHeight: currentHeight + 'px', height: flight.overlapNum * currentHeight + 'px', lineHeight: flight.overlapNum * currentHeight + 'px' }"
                        >
                            {{ flight.acReg }}
                            <span class="setTop" @click="setTopAcReg(item.acType, flight.acReg, _index, item.isSticky, item)">{{ item.isSticky ? "取消" : "置顶" }}</span>
                        </p>
                    </div>
                </div>
            </div>
            <!-- 内容 -->
            <div class="ganttItemBoxWrap" ref="ganttItemBoxWrap" @scroll="GanttScroll($event)">
                <div ref="ganttItemBox" class="ganttItemBox" id="ganttItemBox">
                    <div class="ganttList">
                        <div
                            :class="item.isSticky ? 'sticky' : ''"
                            v-for="(item, index) in ganttList"
                            :key="index"
                            :style="{ lineHeight: currentHeight + 'px', height: item.overlapNum * currentHeight + 'px', top: setStickyTop(index, item.isSticky) }"
                        >
                            <div class="acRegRow" :id="'acRegRow_' + item.acReg" @mouseup="mouseUp($event, item.acReg)">
                                <GanttView
                                    @clickGanttItem="clickGanttItem"
                                    :initDate="initDateTime"
                                    :hourWidht="hourWidht"
                                    :currentHeight="currentHeight"
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
        <!-- 待排区  待排区功能类似已排区 -->
        <div class="waittingGanttContentBox" :style="{ height: waittingGanttContentBoxHeight + 'px' }">
            <div class="resizeHandle" @mousedown="handleWaittingGantt">
                <span :class="['isExpandWaitting', isExpandWaitting ? 'expandGanttWaiting' : '']" @click="expandWaittingGantt"></span>
            </div>
            <div class="waittingGantContent">
                <!-- 机型列表 -->
                <div class="leftAcReg" :style="WaittingLeftAcRegStyle">
                    <div
                        :class="['acTypeList', item.isSticky ? 'sticky' : '']"
                        :style="{ top: setStickyTop(index, item.isSticky) }"
                        v-for="(item, index) in allGanttData"
                        :key="index"
                    >
                        <div class="acType">{{ item.acType }}</div>
                        <div class="acReg">
                            <p
                                v-for="(flight, _index) in item.rows"
                                :key="_index"
                                :style="{
                                    lineHeight: currentHeight + 'px',
                                    height: flight.overlapNum * currentHeight + 'px',
                                    lineHeight: flight.overlapNum * currentHeight + 'px',
                                }"
                            >
                                {{ flight.acReg }}
                                <!-- <span class="setTop" @click="setTopAcReg(item.acType, flight.acReg, _index, item.isSticky, item)">{{ item.isSticky ? "取消" : "置顶" }}</span> -->
                            </p>
                        </div>
                    </div>
                </div>
                <!-- 内容 -->
                <div class="ganttItemBoxWrap" ref="waittingGanttItemBoxWrap" @scroll="waittingGanttScroll($event)">
                    <div ref="waittingGanttItemBox" class="ganttItemBox" id="waittingGanttItemBox">
                        <div class="ganttList">
                            <div
                                :class="item.isSticky ? 'sticky' : ''"
                                v-for="(item, index) in ganttList"
                                :key="index"
                                :style="{ lineHeight: currentHeight + 'px', height: item.overlapNum * currentHeight + 'px', top: setStickyTop(index, item.isSticky) }"
                            >
                                <div class="acRegRow" :id="'acRegRow_' + item.acReg" @mouseup="mouseUp($event, item.acReg)">
                                    <!-- 每个甘特条 -->
                                    <GanttView
                                        @clickGanttItem="clickGanttItem"
                                        :initDate="initDateTime"
                                        :hourWidht="hourWidht"
                                        :currentHeight="currentHeight"
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
            currentHeight: 30, // 拖动缩放甘特条大小
            currentWidth: 24, // 拖动缩放甘特条大小
            currentWindowWidth: 0,
            setTopArr: [], // 置顶数据
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
            WaittingLeftAcRegStyle: {
                position: "relative",
                top: 0,
            },
            // 初始化最左侧时间
            initDateTime: 0,
            // 时间轴相关
            timeLineArr: [],
            timeRange: 24, //一屏显示的小时数
            initHours: 72, // 要展示的小时数，初始化展示48小时
            waittingGanttContentBoxHeight: 10, // 待排区相关信息
            isExpandWaitting: false,
        };
    },
    computed: {
        hourWidht() {
            // 默认屏幕24小时
            let width = this.currentWindowWidth / this.currentWidth;
            return width;
        },
        allGanttData() {
            let data = this.setTopArr.concat(this.flightData);
            data = data.filter((item) => item.rows.length);
            return data;
        },
        // waittingGantData(){

        // }
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
            for (let i = 0; i < this.initHours - 24; i++) {
                let time = new Date().getTime() + i * 1000 * 60 * 60;
                let after24Hours = Math.floor(new Date(time).getHours());
                arr.push(after24Hours);
            }
            this.timeLineArr = arr;
        },
        // 获取机型机号列表和甘特图
        getAcTypeAndAcRegList() {
            this.ganttList = [];
            let data = this.allGanttData;
            data.forEach((item) => {
                item.rows.forEach((ele) => {
                    this.ganttList.push(ele);
                });
            });
            this.calcAcRegOverlap();
        },

        // 计算每个机号是否重叠，重叠了多少层
        calcAcRegOverlap() {
            let _this = this;
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
                        list[i + 1].positionValue.top ? (list[i + 1].positionValue.top += _this.currentHeight) : (list[i + 1].positionValue.top = _this.currentHeight);
                        list[i + 1].positionValue.level = item.overlapNum + 1; // 当前是第几层
                        arr.push(list[i + 1]);
                    }
                }
                // 重叠的重新恢复原本起止时间
                arr.forEach((item) => {
                    let data = genttViewPositionValue(item);
                    item.positionValue.startTime = data.startTime;
                    item.positionValue.endTime = data.endTime;
                });
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
            // console.log(this.ganttList);
            this.removeSelectItem();
        },
        // 设置机号置顶/取消置顶功能
        setTopAcReg(acType, acReg, currentIndex, type, currentRow) {
            if (type) {
                let currentRowItem = currentRow.rows[0];
                currentRowItem.isSticky = false;
                this.flightData.forEach((item) => {
                    // 有机型
                    if (item.acType === acType) {
                        item.rows.splice(currentRow.rows[0].currentIndex, 0, currentRowItem);
                    }
                });
                this.setTopArr.forEach((item, index) => {
                    if (item.acType === acType && item.rows[0].acReg === acReg) {
                        this.setTopArr.splice(index, 1);
                    }
                });
            } else {
                this.flightData.forEach((item) => {
                    if (item.acType === acType) {
                        item.rows.forEach((acRegItem, index) => {
                            if (acRegItem.acReg === acReg) {
                                acRegItem.isSticky = true;
                                acRegItem.currentIndex = currentIndex;
                                this.setTopArr.push({
                                    acType: acType,
                                    isSticky: true,
                                    rows: [acRegItem],
                                });
                                item.rows.splice(index, 1);
                            }
                        });
                    }
                });
            }
            this.getAcTypeAndAcRegList();
        },
        // 更新置顶的重叠高度
        setStickyTop(index, type) {
            if (type) {
                if (index === 0) {
                    return 0;
                } else {
                    let arr = this.allGanttData.slice(0, index);
                    let rowNum = 0;
                    arr.forEach((item) => {
                        rowNum += item.rows[0].overlapNum;
                    });
                    return rowNum * this.currentHeight + "px";
                }
            }
        },
        // 设置容器宽高
        initWrapWidthAndHeight() {
            this.timeLineStyle.width = this.initHours * this.hourWidht + "px"; // 时间轴宽度
            this.$refs.ganttItemBox.style.width = this.initHours * this.hourWidht + "px"; // 甘特图容器宽度
            this.$refs.waittingGanttItemBox.style.width = this.initHours * this.hourWidht + "px"; // 待排区甘特图容器宽度
        },
        // 调整刻度高度变化时
        currentHeightChange() {
            this.getAcTypeAndAcRegList();
        },
        // 调整刻度宽度变化时
        currentWidthChange() {
            this.getAcTypeAndAcRegList();
            this.initWrapWidthAndHeight();
        },
        // 待排区相关方法===========================================================================
        // 点击展开关闭待排区
        expandWaittingGantt() {
            if (this.isExpandWaitting) {
                this.waittingGanttContentBoxHeight = 10;
                this.isExpandWaitting = false;
            } else {
                this.waittingGanttContentBoxHeight = 300;
                this.isExpandWaitting = true;
            }
        },

        // 待排区上下拖动
        handleWaittingGantt() {
            document.onselectstart = () => false;
            document.ondragstart = () => false;
            // 绑定鼠标移动事件
            document.addEventListener("mousemove", this.handleMouseMove);
            // 绑定鼠标放开事件
            document.addEventListener("mouseup", this.handleMouseUp);
        },
        handleMouseMove(event) {
            // 最小高度
            const minHeight = 10;
            // 最大高度  距离顶部100
            const maxHeight = document.documentElement.clientHeight - 200;
            // 最后高度
            let box_height = document.documentElement.clientHeight - event.clientY;

            if (box_height <= minHeight) {
                box_height = minHeight;
            } else if (box_height > maxHeight) {
                box_height = maxHeight;
            }
            if (box_height === minHeight) {
                this.isExpandWaitting = false;
            } else {
                this.isExpandWaitting = true;
            }
            this.waittingGanttContentBoxHeight = box_height;
        },
        // up 事件
        handleMouseUp() {
            // 移除鼠标移动事件
            document.removeEventListener("mousemove", this.handleMouseMove);
            // 移除鼠标放开事件
            document.removeEventListener("mouseup", this.handleMouseUp);
            // 允许用户选择网页中文字
            document.onselectstart = null;
            // 允许用户拖动元素
            document.ondragstart = null;
            //记录高度   或者用localStorage 记录   （在初始加载的时候  把 boxHeight 赋值 记录的高度）
            // this.Storage.set('bottomResultHeight',this.bottomResultHeight)
        },
    },
    mounted() {
        // 获取当前屏幕宽度
        this.currentWindowWidth = document.body.clientWidth - 140;
        this.initWrapWidthAndHeight();
        // 屏幕变化改变每个小时的宽度
        window.onresize = () => {
            this.currentWindowWidth = document.body.clientWidth - 140;
            this.timeLineStyle.width = this.initHours * this.hourWidht + "px";
            this.$refs.ganttItemBox.style.width = this.initHours * this.hourWidht + "px";
        };
        this.getCurrentTime();
        this.flightData = JSON.flightList;
        console.log(this.flightData);
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
    position: relative;
    .searchBox {
        height: 80px;
        display: flex;
        > div {
            flex: 1;
            margin: 0 20px;
        }
    }
    .timeLineBox {
        height: 60px;
        background: #ddd;
        display: flex;
        .leftTopType {
            width: 140px;
            height: 60px;
            position: relative;
            z-index: 100;
            background: #ddd;
        }
        .timeLine {
            height: 100%;
            width: calc(100% - 140px);
            .timeLengthBox {
                height: 100%;
                position: relative;
                p {
                    display: inline-block;
                    height: 100%;
                    line-height: 30px;
                    box-sizing: border-box;
                    border-right: 1px solid #333;
                }
            }
        }
    }
    .ganttContentBox,
    .waittingGanttContentBox {
        height: calc(100% - 240px);
        overflow: hidden;
        // 机型机号列表
        .leftAcReg {
            width: 140px;
            background: #ddd;
            float: left;
            .acTypeList {
                display: flex;
                justify-content: space-between;
                .acType {
                    flex: 1;
                    display: flex;
                    background-color: #ddd;
                    align-items: center;
                    border-bottom: 1px solid #333;
                    border-right: 1px solid #333;
                    box-sizing: border-box;
                    box-sizing: border-box;
                }
                .acReg {
                    width: 90px;
                    p {
                        background-color: #ddd;
                        box-sizing: border-box;
                        border-bottom: 1px solid #333;
                        .setTop {
                            cursor: pointer;
                            color: #3e93f5;
                            font-size: 12px;
                        }
                    }
                }
            }
            .sticky {
                // 置顶功能
                position: sticky;
                position: -webkit-sticky;
                z-index: 101;
                top: 0;
            }
            .sticky:not(.sticky :has(+ .sticky)) {
                box-shadow: 0px 2px 4px #ccc;
            }
        }
        // 甘特图内容
        .ganttItemBoxWrap {
            width: calc(100% - 140px);
            height: 100%;
            overflow: auto;
            .ganttItemBox {
                .ganttList {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    .sticky {
                        // 置顶功能
                        position: sticky;
                        position: -webkit-sticky;
                        border-bottom: 1px solid #ddd;
                        z-index: 101;
                        top: 0;
                    }
                    .sticky:not(.sticky :has(+ .sticky)) {
                        box-shadow: 0px 2px 4px #ccc;
                    }
                    > div {
                        width: 100%;
                        border-bottom: 1px solid #ddd;
                        overflow: hidden;
                        background: #fff;
                        box-sizing: border-box;
                        .acRegRow {
                            width: 100%;
                            height: 100%;
                            position: relative;
                        }
                    }
                }
            }
        }
    }
    .waittingGanttContentBox {
        overflow: visible;
        .resizeHandle {
            height: 10px;
            width: 100%;
            position: relative;
            background: #bbb;
            top: 0;
            cursor: n-resize;
            .isExpandWaitting {
                position: absolute;
                top: -26px;
                left: 50%;
                cursor: pointer;
                border: 14px solid transparent;
                border-bottom-color: #bbb;
            }
            .expandGanttWaiting {
                border: 14px solid transparent;
                border-top-color: #bbb;
                top: 10px;
                z-index: 1;
            }
        }
        .waittingGantContent {
            overflow: hidden;
            height: calc(100% - 10px);
        }
    }
}
</style>
