<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="Gantt" ref="Gantt" @scroll="GanttScroll">
        <li
            @mouseup="mouseUp($event, index)"
            @mouseenter="mouseenter($event, index)"
            :class="'list' + index"
            v-for="(item, index) in 10"
            :key="index"
        >
            <div class="item 123"></div>
        </li>
    </div>
</template>
<script>
export default {
    data() {
        return {
            GanttWrap: null,
            cloneArr: [],
            currentEvent: null,
            cloneNode: null,
            currentNodeTop: 0,
            currentIndex: "auto",
            scrollTop: 0,
        };
    },
    methods: {
        GanttScroll() {
            this.scrollTop = this.$refs.Gantt.scrollTop;
        },
        // 克隆当前拖动元素
        cloneCurrentItem(event) {
            let parentEle = this.GanttWrap;
            console.log(event);
            let currentEle = event.target;
            let cloneItem = currentEle.cloneNode(true);
            cloneItem.dragOrigin = currentEle;
            let currentPositionValue = currentEle.getBoundingClientRect();
            cloneItem.classList.add("cloneItem");
            cloneItem.style.position = "absolute";
            cloneItem.style.pointerEvents = "auto";
            cloneItem.style.opacity = "0.7";
            cloneItem.style.zIndex = 100;
            cloneItem.style.top =
                currentPositionValue.top + this.scrollTop + "px";
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
        mouseUp(event, index) {
            console.log(index);
            // console.log(event);
        },
        moveMethods(ent) {
            let event = this.currentEvent; // 当前点击下的元素
            let point_y = event.offsetY; // 当前鼠标点下去后距离顶部的距离
            let evt = ent || window.event;
            let ele_top = evt.clientY - point_y;
            let target = this.cloneNode; // 克隆的元素
            target.style.pointerEvents = "none";
            target.style.top = ele_top + this.scrollTop + "px";
        },
    },
    mounted() {
        this.GanttWrap = this.$refs.Gantt;



        window.addEventListener("mousedown", (event) => {
            if (event.target.className.indexOf("item") !== -1) {
                this.currentEvent = event;
                let cloneNode = this.cloneCurrentItem(event);
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
        });
        //
    },
};
</script>

<style lang="scss" scoped>
.Gantt {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;

    li {
        width: 100%;
        height: 140px;
        border-bottom: 1px solid #333;
        position: relative;
        box-sizing: border-box;
        z-index: 20;
        .item {
            height: 100px;
            width: 100px;
            position: absolute;
            background: orange;
            cursor: move;
            top: 20px;
            left: 40%;
        }
    }
    .cloneItem {
        height: 100px;
        width: 100px;
        cursor: move;
        background: pink;
        position: absolute;
    }
}
</style>
