// 主要为拖动功能
import cloneDeep from "lodash/cloneDeep";
export default {
    data() {
        return {
            scrollTop: 0,
            anttWrap: null,
            cloneArr: [],
            currentEvent: null,
            cloneNode: null,
            currentNodeTop: 0,
            currentIndex: "auto",
            currentFlightList: [],
        };
    },
    methods: {
        GanttScroll() {
            this.scrollTop = this.$refs.Gantt.scrollTop;
            this.leftAcRegStyle.top = -event.target.scrollTop + "px";
            this.timeLineStyle.left = -event.target.scrollLeft + "px";
        },
        // 克隆当前拖动元素
        cloneCurrentItem(event) {
            let parentEle = this.GanttWrap;
            let currentEle = event.target;
            let cloneItem = currentEle.cloneNode(true);
            cloneItem.dragOrigin = currentEle;
            let currentPositionValue = currentEle.getBoundingClientRect();
            cloneItem.classList.add("cloneItem");
            cloneItem.style.width = currentPositionValue.width + "px"; // 克隆出来的元素的宽高
            cloneItem.style.height = currentPositionValue.height + "px"; // 克隆出来的元素的宽高
            cloneItem.style.position = "absolute";
            cloneItem.style.backgroundColor = "#22a3fe";
            cloneItem.style.cursor = "move";
            cloneItem.style.pointerEvents = "auto";
            cloneItem.style.opacity = "0.7";
            cloneItem.style.zIndex = 100;
            cloneItem.style.top = currentPositionValue.top + this.scrollTop + "px";
            cloneItem.style.left = currentPositionValue.left + "px";

            parentEle.appendChild(cloneItem);

            return cloneItem;
        },
        // 移除克隆的元素
        removeCloneItem() {
            this.cloneArr.forEach((item) => {
                this.GanttWrap.removeChild(item);
                this.cloneArr = [];
            });
        },
        //
        mouseenter(event, index) {
            // console.log(event.srcElement);
            // console.log(index);
        },
        mouseUp(event, acReg) {
            console.log(acReg);
            this.removeMoveItem(acReg);
            // console.log(this.ganttList)
            // console.log(event);
        },
        // 鼠标移动方法
        moveMethods(ent) {
            let event = this.currentEvent; // 当前点击下的元素
            let point_y = event.offsetY; // 当前鼠标点下去后距离顶部的距离
            let evt = ent || window.event;
            let ele_top = evt.clientY - point_y;
            let target = this.cloneNode; // 克隆的元素
            target.style.pointerEvents = "none";
            target.style.top = ele_top + this.scrollTop + "px";
            this.GanttWrap.style.cursor = "move";
        },
        // 删除拖动的元素
        removeMoveItem(acReg) {
            let arr = [];
            this.ganttList.forEach((item) => {
                item.flights.forEach((flight, index) => {
                    if (this.currentFlightList.indexOf(flight.id) !== -1) {
                        let tempFlight = cloneDeep(flight);
                        tempFlight.acReg = acReg;
                        item.flights.splice(index, 1);
                        arr.push(tempFlight);
                    }
                });
            });
            this.ganttList.forEach((item) => {
                if (item.acReg === acReg) {
                    item.flights = item.flights.concat(arr)
                }
            });
            this.calcAcRegOverlap()
        },
    },
    mounted() {
        this.GanttWrap = this.$refs.ganttItemBoxWrap;
        window.addEventListener("mousedown", (event) => {
            this.currentFlightList = [];
            if (event.target.className.indexOf("item") !== -1) {
                this.currentEvent = event;
                let cloneNode = this.cloneCurrentItem(event);

                this.currentFlightList.push(cloneNode.getAttribute("flightid"));

                this.cloneNode = cloneNode;
                this.currentNodeTop = event.target.offsetTop;
                window.addEventListener("mousemove", this.moveMethods);
            }
        });
        window.addEventListener("mouseup", () => {
            let cloneItem = document.querySelectorAll(".cloneItem");
            for (let i = 0; i < cloneItem.length; i++) {
                let item = cloneItem[i];
                this.GanttWrap.removeChild(item);
                this.$forceUpdate();
            }

            window.removeEventListener("mousemove", this.moveMethods);
            this.currentEvent = null;
            this.GanttWrap.style.cursor = "auto";
        });
    },
};
