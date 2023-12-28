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
// 当前bug  如果时间相同，拖拽会重叠

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
            currentFlightList: [],
            isMouseMove: false,
            // selectGanttItemArr: [], // 点击选中的甘特条
        };
    },
    methods: {
        // 甘特图内容滚动事件
        GanttScroll() {
            // this.scrollTop = this.$refs.Gantt.scrollTop;
            // this.scrollLeft = this.$refs.Gantt.scrollLeft;
            this.leftAcRegStyle.top = -event.target.scrollTop + "px";
            this.timeLineStyle.left = -event.target.scrollLeft + "px";
        },

        mouseUp(event, acReg) {
            this.removeMoveItemAndAddMoveItem(acReg);
        },
        // 克隆元素
        cloneCurrentItem(currentEventTarget) {
            let parentEle = this.GanttWrap;
            let currentEle = currentEventTarget;
            let cloneItem = currentEle.cloneNode(true);
            cloneItem.dragOrigin = currentEle;
            let currentPositionValue = currentEle.getBoundingClientRect();
            cloneItem.classList.add("cloneItem");
            cloneItem.classList.remove("selectGanttItem");
            cloneItem.style.width = currentPositionValue.width + "px"; // 克隆出来的元素的宽高
            cloneItem.style.height = currentPositionValue.height + "px"; // 克隆出来的元素的宽高
            cloneItem.style.position = "absolute";
            cloneItem.style.backgroundColor = "#22a3fe";
            cloneItem.style.cursor = "move";
            cloneItem.style.pointerEvents = "auto";
            cloneItem.style.opacity = "0.7";
            cloneItem.style.zIndex = 100;
            cloneItem.style.fontSize = "14px";
            cloneItem.style.top = currentPositionValue.top + this.scrollTop + "px";
            cloneItem.style.left = currentPositionValue.left + "px";

            parentEle.appendChild(cloneItem);

            return cloneItem;
        },

        // 鼠标移动的时候克隆元素
        handleSelectedItem(element) {
            let cloneNode = this.cloneCurrentItem(element);
            this.currentFlightList.push(cloneNode.getAttribute("flightid"));
            this.cloneNode = cloneNode;
            //
            this.currentNodeTop = this.currentEvent.target.offsetTop;
            // 将克隆的元素放到数组里
            this.cloneNodeArr.push(cloneNode);
        },
        // 鼠标移动方法
        moveMethods(ent) {
            if (!this.isMouseMove) {
                let selectGanttItemArr = [];
                // 选择了但是没有拖动选择的
                if (this.currentEvent.target.classList.contains("selectGanttItem")) {
                    selectGanttItemArr = document.querySelectorAll(".selectGanttItem");
                } else {
                    selectGanttItemArr = [this.currentEvent.target];
                }
                // 选择后拖动
                if (selectGanttItemArr.length) {
                    selectGanttItemArr.forEach((item) => {
                        this.handleSelectedItem(item);
                    });
                } else {
                    // 未选择直接拖动
                    this.handleSelectedItem(this.currentEvent.target);
                }
                // 记录每个元素的初始化 Y 轴的位置
                for (let i = 0; i < this.cloneNodeArr.length; i++) {
                    this.cloneNodePositionArr[i] = this.cloneNodeArr[i].getBoundingClientRect().y;
                }
            }
            this.isMouseMove = true;
            if (this.isMouseMove) {
                let event = this.currentEvent; // 当前鼠标点击
                // let offsetEle_y = event.offsetY; // 当前鼠标点下去后距离当前元素顶部的距离
                let evt = ent || window.event; // 拖动的元素
                let pointY = event.y; // 当前鼠标点击后，鼠标点击点位距离顶部的高度(固定不会变)
                // let currentMouseClientY = evt.clientY; //  evt.clientY 为当前鼠标距离页面顶部的距离，随着移动不断变化
                for (let i = 0; i < this.cloneNodeArr.length; i++) {
                    let target = this.cloneNodeArr[i]; // 克隆的元素
                    let ele_top = evt.clientY - pointY + this.cloneNodePositionArr[i];
                    target.style.pointerEvents = "none";
                    target.style.top = ele_top + "px";
                    this.GanttWrap.style.cursor = "move";
                }
            }
        },
        // 删除拖动的元素并且将拖动的元素放到新的机型里面
        // 暂时无机型后续再增加
        removeMoveItemAndAddMoveItem(acReg) {
            let arr = [];
            this.currentFlightList.forEach((item) => {
                this.ganttList.forEach((acRegList) => {
                    acRegList.flights.forEach((flight, index) => {
                        if (flight.id === item) {
                            let tempFlight = cloneDeep(flight);
                            tempFlight.acReg = acReg;
                            acRegList.flights.splice(index, 1);
                            arr.push(tempFlight);
                        }
                    });
                });
            });
            this.ganttList.forEach((item) => {
                if (item.acReg === acReg) {
                    item.flights = item.flights.concat(arr);
                }
            });
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
            element.classList.add("selectGanttItem");
        },
    },
    mounted() {
        this.GanttWrap = this.$refs.ganttItemBoxWrap;
        window.addEventListener("mousedown", (event) => {
            this.currentFlightList = [];
            this.cloneNodeArr = [];
            if (event.target.className.indexOf("ganttItem") !== -1) {
                this.currentEvent = event; // 当前鼠标点击下的元素
                window.addEventListener("mousemove", this.moveMethods);
            }
        });
        window.addEventListener("mouseup", () => {
            this.isMouseMove = false;
            let cloneItem = document.querySelectorAll(".cloneItem");
            for (let i = 0; i < cloneItem.length; i++) {
                let item = cloneItem[i];
                this.GanttWrap.removeChild(item); // 移除克隆的元素
            }
            if (this.cloneNodeArr.length) {
                this.calcAcRegOverlap(); // 重新计算位置
            }
            this.cloneNodeArr = [];
            window.removeEventListener("mousemove", this.moveMethods); // 鼠标松开移除监听事件
            this.currentEvent = null;
            this.GanttWrap.style.cursor = "auto";
        });
    },
    // 移除监听事件
    beforeDestroy() {},
};
