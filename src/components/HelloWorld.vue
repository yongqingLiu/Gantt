<template>
    <div class="gantt" ref="Gantt" @scroll="GanttScroll">
        <div class="searchBox">
            <el-form :inline="true" class="demo-form-inline">
                <el-form-item>
                    <el-input v-model="searchText" placeholder="航班号、起降机场"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="getFlight">查询</el-button>
                    <el-button type="primary" @click="nextFlight">下一个</el-button>
                    <el-button type="primary" @click="reflashData">刷新数据</el-button>
                    <el-button type="primary" @click="upodateFlightData">更新数据</el-button>
                    <el-button type="primary" @click="getChangeData">获取数据</el-button>
                </el-form-item>
            </el-form>
            <div class="sliderBox">
                <div>高度： <el-slider :min="24" :max="70" v-model="currentHeight"></el-slider></div>
                <div>小时数: <el-slider :min="12" :max="72" v-model="currentWidth" @input="currentWidthChange"></el-slider></div>
            </div>
        </div>
        <!-- 时间线 -->
        <div class="timeLineBox">
            <div class="leftTopType">
                <span class="acType">机型</span>
                <span class="acReg">机号</span>
            </div>
            <div class="timeLine">
                <div ref="timeLengthBox" :style="timeLineStyle" class="timeLengthBox">
                    <div class="date">
                        <div v-for="(value, key, index) in dateTimeArr" :key="index" :style="{ width: value * hourWidht + 'px' }">
                            {{ $dayjs(key).format("YYYY-MM-DD") + "（" + getWeekStr(key) + "）" }}
                        </div>
                    </div>
                    <div class="dateTime">
                        <div class="dateTime" v-for="(item, index) in timeLineArr" :key="index" :style="{ width: hourWidht + 'px' }">
                            {{ hourWidht < 40 ? item.time : item.time + ":00" }}
                            <span class="zeroTimeLine" :style="{ height: zeroTimeLineHeight + 'px' }" v-if="item.time === 0"></span>
                            <span class="currentTimeLine" :style="{ height: zeroTimeLineHeight + 'px', left: currentTimeLine.left }" v-if="item.current">
                                <label>{{ currentTimeLine.time }}</label>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 甘特图内容 -->
        <div class="ganttContentBox" :style="{ height: `calc(100% - 140px - ${waittingGanttContentBoxHeight}px)` }">
            <!-- 机型列表 -->
            <div class="leftAcReg" :style="leftAcRegStyle">
                <div
                    :class="['acTypeList', item.isSticky ? 'sticky' : '']"
                    :style="{ top: setStickyTop(index, item.isSticky) }"
                    v-for="(item, index) in acTypeGanttData"
                    :key="index"
                >
                    <div class="acType">{{ item.acType }}</div>
                    <div class="acReg">
                        <div
                            v-for="(flight, _index) in item.rows"
                            :key="_index"
                            :style="{ lineHeight: currentHeight + 'px', height: flight.overlapNum * currentHeight + 'px', lineHeight: flight.overlapNum * currentHeight + 'px' }"
                        >
                            {{ flight.acReg }}
                            <span class="setTop" @click="setTopAcReg(item.acType, flight.acReg, _index, item.isSticky, item)">{{ item.isSticky ? "取消" : "置顶" }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 内容 -->
            <div class="ganttItemBoxWrap" ref="ganttItemBoxWrap" id="ganttItemBoxWrap" @scroll="GanttScroll($event)">
                <div ref="ganttItemBox" class="ganttItemBox" id="ganttItemBox">
                    <div class="acRegGanttList">
                        <div
                            :class="item.isSticky ? 'sticky' : ''"
                            v-for="(item, index) in acRegGanttList"
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
                        v-for="(item, index) in waittingAcTypeGantData"
                        :key="index"
                    >
                        <div class="acType">{{ item.acType }}</div>
                        <div class="acReg">
                            <div
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
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 内容 -->
                <div class="ganttItemBoxWrap" ref="waittingGanttItemBoxWrap" @scroll="waittingGanttScroll($event)">
                    <div ref="waittingGanttItemBox" class="ganttItemBox" id="waittingGanttItemBox">
                        <div class="acRegGanttList">
                            <div
                                :class="item.isSticky ? 'sticky' : ''"
                                v-for="(item, index) in waittingAcRegGanttList"
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
            setTopArr: [], // 置顶机号数据
            flightData: [], //请求获取来的数据
            allAcRegGanttList: [], // 所有甘特条数据
            acRegGanttList: [], // 已排区甘特图机号数据
            waittingAcRegGanttList: [], // 待排区甘特条数据
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
            timer: null,
            currentTimeLine: {},
            timeLineArr: [], // 时间轴小时数
            dateTimeArr: {}, // 时间轴日期
            timeRange: 24, //一屏显示的小时数
            initHours: 72, // 要展示的小时数，初始化展示48小时
            waittingGanttContentBoxHeight: 10, // 待排区相关信息
            isExpandWaitting: false,
            searchText: "",
            searchFlightList: [], // 查询到的航班
        };
    },
    computed: {
        zeroTimeLineHeight() {
            return this.$refs.ganttItemBoxWrap.clientHeight;
        },
        hourWidht() {
            // 默认屏幕24小时
            let width = this.currentWindowWidth / this.currentWidth;
            return width;
        },
        allActypeGanttData() {
            let data = this.setTopArr.concat(this.flightData);
            data = data.filter((item) => item.rows.length);
            return data;
        },
        acTypeGanttData() {
            let data = this.setTopArr.concat(this.flightData.filter((item) => item.ganttType !== "waitting"));
            data = data.filter((item) => item.rows.length);
            return data;
        },
        waittingAcTypeGantData() {
            let data = this.flightData.filter((item) => item.ganttType == "waitting");
            data = data.filter((item) => item.rows.length);
            return data;
        },
        weekEnum() {
            return {
                1: "星期一",
                2: "星期二",
                3: "星期三",
                4: "星期四",
                5: "星期五",
                6: "星期六",
                7: "星期日",
            };
        },
    },
    methods: {
        // 下一个航班
        nextFlight() {},
        // 搜索航班功能
        getFlight() {
            let text = this.searchText;
            if (!text) return;
            let arr = [];

            this.acRegGanttList.forEach((acRegList) => {
                acRegList.flights.forEach((flight) => {
                    if (
                        String(flight.arrivalAirport)?.indexOf(text.toUpperCase()) !== -1 ||
                        String(flight.departureAirport)?.indexOf(text.toUpperCase()) !== -1 ||
                        String(flight.flightNo)?.indexOf(text) !== -1
                    ) {
                        arr.push(flight);
                    }
                });
            });
            arr = this.sortFlightData(arr);
            this.searchFlightList = arr;
            arr[0].isHeightLight = true;
            let flight = document.getElementById("flight_" + (arr[0].flightId || arr[0].id));
            let scrollBox = document.getElementById("ganttItemBoxWrap");
            this.scrollToElement(flight, scrollBox);
        },
        // 根据查出来的航班进行排序（优先当天、下一天、前一天）
        sortFlightData(arr) {
            // 获取当前日期
            let today = new Date();
            // 获取前一日的时间戳
            let startPrevDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0, 0).getTime();
            let endPrevDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59, 999).getTime();

            // 前一天的数据放在最后
            let prevArr = [];
            let otherArr = [];

            arr.forEach((item) => {
                // 优先etd  然后std
                let date = item.etd || item.std;
                item.customTimestamp = date ? new Date(date).getTime() : "";
                if (item.customTimestamp >= startPrevDay && item.customTimestamp <= endPrevDay) {
                    prevArr.push(item);
                } else {
                    otherArr.push(item);
                }
            });
            prevArr.sort((a, b) => a.customTimestamp - b.customTimestamp);
            otherArr.sort((a, b) => a.customTimestamp - b.customTimestamp);
            return [...otherArr, ...prevArr];
        },
        // 获取星期几
        getWeekStr(day) {
            return this.weekEnum[this.$dayjs(day).day()];
        },
        // 更新当前时间
        updateCurrentTime() {
            let time = new Date().getMinutes();
            this.currentTimeLine = {
                left: (Number(time) / 60) * this.hourWidht + "px",
                time: this.$dayjs().format("HH:mm"),
            };
        },
        // 获取当前时间轴，当前时刻线
        getCurrentTime() {
            let arr = [];
            const now = new Date();
            const before24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            this.initDateTime = new Date(this.$dayjs(before24Hours).format("YYYY-MM-DD HH:00")).getTime();
            for (let i = 0; i < 24; i++) {
                const hour = Math.floor(before24Hours.getHours());
                let date = this.$dayjs(before24Hours).format("YYYY-MM-DD");
                this.dateTimeArr[date] !== undefined ? (this.dateTimeArr[date] += 1) : (this.dateTimeArr[date] = 1);
                arr.push({ time: hour });
                before24Hours.setHours(before24Hours.getHours() + 1);
            }
            for (let i = 0; i < this.initHours - 24; i++) {
                let time = new Date().getTime() + i * 1000 * 60 * 60;
                let date = this.$dayjs(time).format("YYYY-MM-DD");
                this.dateTimeArr[date] !== undefined ? (this.dateTimeArr[date] += 1) : (this.dateTimeArr[date] = 1);
                let after24Hours = Math.floor(new Date(time).getHours());
                arr.push({ time: after24Hours, current: i === 0 ? true : false });
            }
            this.timeLineArr = arr;
        },
        // 获取机型机号列表和甘特图
        getAcTypeAndAcRegList() {
            this.allAcRegGanttList = [];
            this.acRegGanttList = [];
            this.waittingAcRegGanttList = [];
            let data = this.allActypeGanttData;
            data.forEach((item) => {
                item.rows.forEach((ele) => {
                    this.allAcRegGanttList.push(ele);
                    if (item.ganttType === "waitting") {
                        this.waittingAcRegGanttList.push(ele);
                    } else {
                        this.acRegGanttList.push(ele);
                    }
                });
            });
            // 计算甘特图位置重叠方法
            this.calcAcRegOverlap();
        },

        // 设置机号置顶/取消置顶功能
        setTopAcReg(acType, acReg, currentIndex, type, currentRow) {
            if (type) {
                let currentRowItem = currentRow.rows[0];
                currentRowItem.isSticky = false;
                this.flightData.forEach((item) => {
                    // 有机型
                    if (item.acType === acType && item.ganttType !== "waitting") {
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
                    if (item.acType === acType && item.ganttType !== "waitting") {
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
        // 更新设置置顶的高度
        setStickyTop(index, type) {
            if (type) {
                if (index === 0) {
                    return 0;
                } else {
                    let arr = this.acTypeGanttData.slice(0, index);
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
        // 调整刻度宽度变化时
        currentWidthChange() {
            this.initWrapWidthAndHeight();
            this.updateCurrentTime();
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
        // 移除选中元素
        removeSelectItem() {
            let allElement = document.querySelectorAll(".ganttItem") || [];
            for (let i = 0; i < allElement.length; i++) {
                allElement[i].classList.remove("selectGanttItem");
            }
        },
        // 鼠标点击事件（高亮选择）
        clickGanttItem(event) {
            let ctrlKeyFlag = event.ctrlKey; // 判断ctrl 是否按下
            if (!ctrlKeyFlag) {
                this.removeSelectItem();
            }
            let element = event.target;
            if (element.classList.contains("selectGanttItem")) {
                element.classList.remove("selectGanttItem");
            } else {
                element.classList.add("selectGanttItem");
            }
        },
        // 刷新数据
        reflashData() {
            console.log(this.setTopArr);
        },
        // 更新数据
        upodateFlightData() {
            this.changeFlightGanttList[0].ata = "2024-08-10T19:00:00.000+08:00";
            console.log(this.changeFlightGanttList);
            console.log(this.allAcRegGanttList);

            for (let i = 0; i < this.changeFlightGanttList.length; i++) {
                let changeItem = this.changeFlightGanttList[i];
                let acReg = changeItem.acReg;
                let initAcReg = this.initChangeFlightGanttList[i].acReg; // 初始的航班信息
                for (let k = 0; k < this.allAcRegGanttList.length; k++) {
                    let currentItem = this.allAcRegGanttList[k];
                    if (currentItem.acReg === acReg) {
                        let hasFlightFlag = false;
                        currentItem.flights.forEach((item, index) => {
                            if (item.id === changeItem.id) {
                                hasFlightFlag = true;
                                currentItem.flights[index] = changeItem;
                            }
                        });
                        if (!hasFlightFlag) {
                            currentItem.flights.push(changeItem);
                            // 原本的移除
                            this.allAcRegGanttList.forEach((item) => {
                                if (item.acReg === initAcReg) {
                                    item.flights = item.flights.filter((flight) => flight.id !== changeItem.id);
                                }
                            });
                        }
                    }
                }
            }
            this.$nextTick(() => {
                this.calcAcRegOverlap();
            });
        },
        getChangeData() {
            console.log(this.changeFlightGanttList);
        },
    },
    mounted() {
        // 获取当前屏幕宽度
        this.currentWindowWidth = this.$refs.Gantt.clientWidth - 140;
        this.initWrapWidthAndHeight();
        // 屏幕变化改变每个小时的宽度
        window.onresize = () => {
            this.currentWindowWidth = this.$refs.Gantt.clientWidth - 140;
            this.timeLineStyle.width = this.initHours * this.hourWidht + "px";
            this.$refs.ganttItemBox.style.width = this.initHours * this.hourWidht + "px";
            this.updateCurrentTime();
        };
        this.getCurrentTime();
        // 获取数据后
        // console.log(this.setTopArr);
        let ganttData = JSON.flightList;
        let waittingGanttData = JSON.flightListNon || [];

        waittingGanttData.forEach((item) => (item.ganttType = "waitting"));
        this.flightData = ganttData.concat(waittingGanttData);

        // console.log(this.flightData);
        this.getAcTypeAndAcRegList();
        this.$refs.ganttItemBoxWrap.scrollLeft = this.hourWidht * 12;
        // 更新时间
        this.updateCurrentTime();
        this.timer = setInterval(() => {
            this.updateCurrentTime();
        }, 10000);
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

        .sliderBox {
            display: flex;
            flex: 1;
            > div {
                flex: 1;
                margin: 0 20px;
            }
        }
    }
    .timeLineBox {
        height: 60px;
        border-bottom: 2px solid #a5a5a5;

        box-sizing: border-box;
        display: flex;
        .leftTopType {
            width: 140px;
            height: 60px;
            position: relative;
            z-index: 3;
            background: #fff;
            display: flex;
            line-height: 60px;
            box-sizing: border-box;
            border-bottom: 2px solid #a5a5a5;
            border-right: 1px solid #a5a5a5;
            border-top: 1px solid #a5a5a5;
            text-align: center;
            font-weight: bold;
            .acType {
                display: block;
                width: 49px;
                box-sizing: border-box;
                border-right: 1px solid #a5a5a5;
            }
            .acReg {
                display: block;
                flex: 1;
            }
        }
        .timeLine {
            height: 100%;
            width: calc(100% - 140px);
            color: #595959;
            font-weight: bold;
            .dateValue {
                height: 30px;
                display: flex;
                line-height: 30px;
            }
            .timeLengthBox {
                height: 100%;
                position: relative;
                .date {
                    height: 30px;
                    display: flex;
                    div {
                        line-height: 30px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        border-bottom: 1px solid #a5a5a5;
                        border-top: 1px solid #a5a5a5;
                        border-right: 1px solid #a5a5a5;
                    }
                }
                .dateTime {
                    > div {
                        display: inline-block;
                        height: 100%;
                        line-height: 30px;
                        box-sizing: border-box;
                        border-right: 1px solid #a5a5a5;
                        position: relative;
                        .zeroTimeLine,
                        .currentTimeLine {
                            position: absolute;
                            z-index: 11;
                            left: -1px;
                            height: 200px;
                            display: block;
                            width: 2px;
                            top: 30px;
                            background: orange;
                        }
                        .currentTimeLine {
                            background: #7176f9;
                            label {
                                color: #7176f9;
                                position: absolute;
                                font-weight: bold;
                                top: 100px;
                            }
                        }
                    }
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
            background: #fefefe;
            float: left;
            z-index: 20;
            box-sizing: border-box;
            border-right: 1px solid #a5a5a5;
            color: #595959;
            font-weight: bold;
            .acTypeList {
                display: flex;
                justify-content: space-between;
                .acType {
                    flex: 1;
                    display: flex;
                    width: 50px;
                    align-items: center;
                    border-bottom: 1px solid #a5a5a5;
                    border-right: 1px solid #a5a5a5;
                    background: #fff;
                    box-sizing: border-box;
                }
                .acReg {
                    width: 90px;
                    background: #fff;
                    > div {
                        box-sizing: border-box;
                        border-bottom: 1px solid #a5a5a5;
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
                z-index: 10;
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
                .acRegGanttList {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    .sticky {
                        // 置顶功能
                        position: sticky;
                        position: -webkit-sticky;
                        border-bottom: 1px solid #ddd;
                        z-index: 10;
                        top: 0;
                    }
                    .sticky:not(.sticky :has(+ .sticky)) {
                        box-shadow: 0px 2px 4px #ccc;
                    }
                    > div {
                        width: 100%;
                        // border-bottom: 1px solid #ddd;
                        overflow: hidden;
                        background: #e9f7ff;
                        box-sizing: border-box;
                        .acRegRow {
                            width: 100%;
                            height: 100%;
                            position: relative;
                        }
                    }
                    > div:nth-child(even) {
                        background: #fff;
                    }
                    > div:hover {
                        background: #cfe9fc;
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
    ::v-deep {
        // 甘特条颜色，拖动提到外边方便样式穿透
        .ganttItem {
            background: #409eff;
            border-radius: 2px;
            box-shadow: 0 1px 1px 1px #ddd;
            text-align: center;
            font-size: 16px;
            cursor: move;
        }
        // 改变的甘特条
        .isChange {
            background: red;
        }
        .selectGanttItem {
            background: #ffbf00;
        }
        // 检修
        .overhaulFlag {
            background: linear-gradient(180deg, #f3a499 10%, #f0bab3 20%, #f3a499 30%, #f0bab3 40%, #f3a499 50%, #f0bab3 60%, #f3a499 70%, #f0bab3 80%, #f3a499 90%);
        }
    }
}
</style>
