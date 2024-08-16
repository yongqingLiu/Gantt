// 实现思路
// 1、首先实现拖拽功能
//     鼠标点击下后（如果点击的是甘特条）不松开，则增加监听移动事件
// 2、移动事件
//     对推拽的元素进行克隆，设置克隆元素的宽高和位置，基于被克隆元素的样式，并且记录下每个元素初始距离顶部的距离
// 3、移动方法
//     鼠标动态移动，高度实时变化，如果是多选其他元素 基于拖动的元素的高度差，实时赋值；
// 4、鼠标松开
//     松开后到那个机号，将拖动的元素从原来的删除掉，新增到新的机型机号上面
// 5、移除监听事件，从新计算位置

// 主要为拖动功能
import cloneDeep from "lodash/cloneDeep";
export default {
    data() {
        return {
            scrollTop: 0,
            scrollLeft: 0,
            anttWrap: null,
            cloneArr: [],
            currentEvent: null,
            cloneNode: null,
            cloneNodeArr: [],
            cloneNodePositionArr: [],
            currentIndex: "auto",
            currentFlightIdList: [], // 当前移动的甘特条的航班id
            isMouseMove: false,
            isGanttItemFlag: false, // 是否是甘特条
            isGanttItemMoveFlag: false, // 是否是甘特条移动
            changeFlightGanttList: [], // 拖动改变的航班甘特条数据
            initChangeFlightGanttList: [], // 拖动改变的航班甘特条数据(用作航班调整记录机号等相关信息)
        };
    },
    methods: {
        // 滚动函数
        scrollToElement(element, scrollContainer) {
            // 确保传入的element是DOM元素
            if (!(element instanceof HTMLElement)) {
                console.error("The element must be a DOM element.");
                return;
            }
            // 确保传入的scrollContainer是DOM元素
            if (!(scrollContainer instanceof HTMLElement)) {
                console.error("The scrollContainer must be a DOM element.");
                return;
            }
            // 获取子元素的矩形位置信息
            const elementRect = element.getBoundingClientRect();
            // 计算子元素的中心位置
            const elementMiddle = elementRect.top + elementRect.height / 2;
            const elementLeft = elementRect.left + elementRect.width / 2;
            // 获取滚动容器的scrollTop和高度
            const { scrollTop, clientHeight, scrollLeft, clientWidth } = scrollContainer;
            // 计算滚动位置，使得子元素的中心与滚动容器的中心对齐
            const scrollToPositionTop = elementMiddle - clientHeight / 2 + scrollTop;
            const scrollToPositionLeft = elementLeft - clientWidth / 2 + scrollLeft;
            // 滚动到计算出的位置
            scrollContainer.scrollTop = scrollToPositionTop;
            scrollContainer.scrollLeft = scrollToPositionLeft;
        },
        // 甘特图内容滚动事件
        GanttScroll(event) {
            // this.scrollTop = this.$refs.Gantt.scrollTop;
            // this.scrollLeft = this.$refs.Gantt.scrollLeft;
            this.leftAcRegStyle.top = -event.target.scrollTop + "px";
            this.timeLineStyle.left = -event.target.scrollLeft + "px";
            if (!this.$refs.waittingGanttItemBoxWrap) return;
            this.$refs.waittingGanttItemBoxWrap.scrollLeft = event.target.scrollLeft;
        },
        waittingGanttScroll(event) {
            this.WaittingLeftAcRegStyle.top = -event.target.scrollTop + "px";
            this.$refs.ganttItemBoxWrap.scrollLeft = event.target.scrollLeft;
        },

        mouseUp(event, acReg) {
            this.removeMoveItemAndAddMoveItem(acReg);
        },
        //获取元素距离指定元素的距离
        getDistanceToElement(currentEle) {
            const rect1 = currentEle.getBoundingClientRect();
            const rect2 = this.$refs.Gantt.getBoundingClientRect();
            // 计算距离 
            const distance = {
                top: rect1.bottom - rect2.top - rect1.height - rect2.top,
                left: rect1.right - rect2.left - rect1.width,
            };
            return distance;
        },
        // 克隆元素
        cloneCurrentItem(currentEventTarget) {
            let parentEle = this.GanttWrap;
            let currentEle = currentEventTarget;
            let cloneItem = currentEle.cloneNode(true);
            cloneItem.dragOrigin = currentEle;
            // console.log(cloneItem);
            let currentHeightAndWidth = currentEle.getBoundingClientRect();
            let currentPositionValue = this.getDistanceToElement(currentEle);
            cloneItem.classList.add("cloneItem");
            cloneItem.classList.remove("selectGanttItem");
            cloneItem.style.width = currentHeightAndWidth.width + "px"; // 克隆出来的元素的宽高
            cloneItem.style.height = currentHeightAndWidth.height + "px"; // 克隆出来的元素的宽高
            cloneItem.style.position = "absolute";
            // cloneItem.style.backgroundColor = "#22a3fe";
            cloneItem.style.cursor = "move";
            cloneItem.style.pointerEvents = "auto";
            cloneItem.style.opacity = "0.76";
            cloneItem.style.zIndex = 110;
            cloneItem.style.fontSize = "14px";
            cloneItem.style.top = currentPositionValue.top + this.scrollTop + "px";
            cloneItem.style.left = currentPositionValue.left + "px";

            parentEle.appendChild(cloneItem);

            return cloneItem;
        },
        // 校验甘特条能否拖动
        limitGanttItemMoveRule(flight) {
            let flag = true;
            if (flight.waitingStatus === "MAINTAIN") {
                this.$message.warning("不可拖动！");
                flag = false;
            }
            return flag;
        },
        // 鼠标移动的时候克隆元素
        handleSelectedItem(element) {
            let cloneNode = this.cloneCurrentItem(element);
            this.currentFlightIdList.push(cloneNode.getAttribute("flightid"));
            this.cloneNode = cloneNode;
            //
            this.currentNodeTop = this.currentEvent.target.offsetTop;
            // 将克隆的元素放到数组里
            this.cloneNodeArr.push(cloneNode);
        },
        // 鼠标移动方法 （主要方法）
        mouseMoveMethods(ent) {
            // console.log('move')
            if (!this.isMouseMove) {
                let selectGanttItemArr = [];

                if (this.currentEvent.target.classList.contains("selectGanttItem")) {
                    // 选择高亮后拖动
                    selectGanttItemArr = document.querySelectorAll(".selectGanttItem");
                } else {
                    // 点击直接拖动------
                    // 点击的如果是 ganttItem 的子元素，则一直网上找，找到 ganttItem 为止
                    let tempTarget = this.currentEvent.target;
                    while (tempTarget && !tempTarget.classList.contains("ganttItem")) {
                        tempTarget = tempTarget.parentNode;
                    }
                    // selectGanttItemArr = [this.currentEvent.target];
                    selectGanttItemArr = [tempTarget];
                }
                // 选择后拖动
                if (selectGanttItemArr.length) {
                    selectGanttItemArr.forEach((item) => {
                        this.handleSelectedItem(item);
                    });
                }
                // else {
                //     // 未选择直接拖动 ???------- 应该走不到这一步
                //     // this.handleSelectedItem(this.currentEvent.target);
                // }
                // 记录每个元素的初始化 Y 轴的位置
                for (let i = 0; i < this.cloneNodeArr.length; i++) {
                    this.cloneNodePositionArr[i] = this.cloneNodeArr[i].getBoundingClientRect().y;
                }
            }
            this.isMouseMove = true;
            if (this.isMouseMove) {
                let event = this.currentEvent; // 当前鼠标点击
                // console.log(event)
                // let offsetEle_y = event.offsetY; // 当前鼠标点下去后距离当前元素顶部的距离
                // let offsetEle_X = event.offsetX; // 当前鼠标点下去后距离当前元素顶部的距离   ---横向移动
                let evt = ent || window.event; // 拖动的元素
                let pointY = event.y; // 当前鼠标点击后，鼠标点击点位距离顶部的高度(固定不会变)
                // let currentMouseClientY = evt.clientY; //  evt.clientY 为当前鼠标距离页面顶部的距离，随着移动不断变化
                for (let i = 0; i < this.cloneNodeArr.length; i++) {
                    let target = this.cloneNodeArr[i]; // 克隆的元素
                    let ele_top = evt.clientY - pointY + this.cloneNodePositionArr[i];
                    // let ele_left = evt.clientX - offsetEle_X; // ---横向移动
                    target.style.pointerEvents = "none";
                    target.style.top = ele_top + "px";
                    // target.style.left = ele_left + "px"; // ---横向移动
                    this.GanttWrap.style.cursor = "move";
                }
                this.isGanttItemMoveFlag = true;
            }
        },
        // 删除拖动的元素并且将拖动的元素放到新的机型里面
        // 暂时无机型后续再增加
        removeMoveItemAndAddMoveItem(acReg) {
            let arr = [];
            this.currentFlightIdList.forEach((item) => {
                this.allAcRegGanttList.forEach((acRegList) => {
                    acRegList.flights.forEach((flight, index) => {
                        if (flight.id === item && flight.acReg !== acReg) {
                            if (!this.limitGanttItemMoveRule(flight)) return;
                            // 拖动的航班id匹配，切更换机号
                            let tempFlight = cloneDeep(flight);
                            if (!tempFlight.isChange) {
                                // 还没有改变的时候记录下初始的机号
                                tempFlight.initAcReg = tempFlight.acReg;
                            }
                            tempFlight.acReg = acReg;
                            tempFlight.isChange = true; // 拖动航班改变了
                            if (tempFlight.initAcReg === acReg) {
                                // console.log("拖到初始的机号上了");
                                tempFlight.isChange = false; // 拖动航班未改变
                            }
                            acRegList.flights.splice(index, 1);
                            arr.push(tempFlight);
                        }
                    });
                });
            });
            if (!arr.length) return;
            this.allAcRegGanttList.forEach((item) => {
                if (item.acReg === acReg) {
                    item.flights = item.flights.concat(arr);
                }
            });
            this.changeFlightGanttList = this.filterChangeFlightGanttList(arr);
            this.initChangeFlightGanttList = cloneDeep(this.changeFlightGanttList);
            // console.log(this.changeFlightGanttList);
        },
        // 过滤变更的元素
        filterChangeFlightGanttList(arr) {
            if (!this.changeFlightGanttList.length) {
                return arr;
            }
            let tempFlightArr = cloneDeep(this.changeFlightGanttList);
            // 遍历改变的甘特条，如果新的和已有的甘特条id相同则替换，最后去除没有改变的
            tempFlightArr.forEach((item, index) => {
                arr.forEach((flight, _index) => {
                    if (flight.id === item.id) {
                        tempFlightArr[index] = flight;
                        arr[_index].isInvalidFlag = true; // 将相同的元素打上标记去除
                    }
                });
            });
            arr = arr.filter((item) => !item.isInvalidFlag);
            tempFlightArr = tempFlightArr.filter((item) => item.isChange).concat(arr);
            return tempFlightArr;
        },
        // 计算每个机号是否重叠，重叠了多少层
        calcAcRegOverlap() {
            // let _this = this;
            // 设置开始和结束时间
            function genttViewPositionValue(flight) {
                let startTime = flight.atd || flight.etd || flight.std || flight.ptd || flight.depTime;
                let endTime = flight.ata || flight.eta || flight.sta || flight.pta || flight.arrTime;
                return {
                    startTime: new Date(startTime).getTime(),
                    endTime: new Date(endTime).getTime(),
                };
            }
            // 重叠判断
            function overlapHandle(list, item) {
                let arr = [];
                for (let i = 0; i < list.length; i++) {
                    // 后一个元素存在，并且后一个元素的开始时间小于前一个的结束时间（说明重叠，标志置为true），后一个元素向下移动高度；
                    if (list[i + 1] && list[i].positionValue.endTime > list[i + 1].positionValue.startTime) {
                        item.isOverlapFloag = true; // 是否有重叠标志 --- 有
                        list[i + 1].positionValue.endTime = list[i].positionValue.endTime;
                        // list[i + 1].positionValue.top ? (list[i + 1].positionValue.top += _this.currentHeight) : (list[i + 1].positionValue.top = _this.currentHeight);
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
            this.allAcRegGanttList.forEach((item) => {
                item.isOverlapFloag = false; // 是否有重叠的标准 --- 没有
                item.overlapNum = 1;
                item.flights.forEach((flight) => {
                    let data = genttViewPositionValue(flight);
                    this.$set(flight, "isHeightLight", false); // 添加高亮标志
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
            // this.removeSelectItem();
        },

        // mousedown 事件
        mousedownMethods(event) {
            this.currentFlightIdList = [];
            this.cloneNodeArr = [];
            // 如果是子元素
            if (event.target.className.indexOf("ganttItem") !== -1 || event.target.className.indexOf("flagIconBox") !== -1 || event.target.className.indexOf("iconName") !== -1) {
                this.currentEvent = event; // 当前鼠标点击下的元素
                this.isGanttItemFlag = true;
                window.addEventListener("mousemove", this.mouseMoveMethods);
            }
        },
        mouseUpMethods() {
            window.removeEventListener("mousemove", this.mouseMoveMethods); // 优先移除事件 鼠标松开移除监听事件
            if (!this.isGanttItemFlag || !this.isGanttItemMoveFlag) return; // 是否是点击在甘特条上
            // console.log("是否是点击在甘特条上")
            this.isMouseMove = false;
            let cloneItem = document.querySelectorAll(".cloneItem");
            for (let i = 0; i < cloneItem.length; i++) {
                let item = cloneItem[i];
                this.GanttWrap.removeChild(item); // 移除克隆的元素
            }
            if (this.cloneNodeArr.length) {
                this.calcAcRegOverlap(); // 重新计算位置
            }
            // this.cloneNodeArr = [];
            this.currentEvent = null;
            this.GanttWrap.style.cursor = "auto";
            this.isGanttItemFlag = false;
            // console.log("鼠标松开移除监听事件")
            // console.log(this.isGanttItemFlag)
            this.isGanttItemMoveFlag = false;
        },
    },
    mounted() {
        this.GanttWrap = this.$refs.ganttItemBoxWrap;
        window.addEventListener("mousedown", this.mousedownMethods);
        window.addEventListener("mouseup", this.mouseUpMethods);
    },
    // 移除监听事件
    beforeDestroy() {
        window.removeEventListener("mousedown", this.mousedownMethods);
        window.removeEventListener("mouseup", this.mouseUpMethods);
        clearInterval(this.timer);
        window.onresize = null;
    },
};
