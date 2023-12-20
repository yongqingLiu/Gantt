<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="Gantt" ref="Gantt">
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
import interact from "interactjs";
export default {
    data() {
        return {
            text: "123",
            GanttWrap: null,
            cloneArr: [],
            currentEvent: null,
        };
    },
    methods: {
        // 拖动监听事件
        listenerMove(event) {
            let target = event.target;
            // var x =
            //     (parseFloat(target.getAttribute("data-x")) || 0) +
            //     event.dx;
            var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
            target.style.setProperty(
                "transform",
                "translate3d(" + 0 + "px, " + y + "px, 0)"
            ); // 只允许Y轴拖动
            // target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
        },
        // 克隆当前拖动元素
        cloneCurrentItem(event) {
            let parentEle = this.GanttWrap;
            let currentEle = event.target;

            let cloneItem = currentEle.cloneNode(true);
            cloneItem.dragOrigin = currentEle;

            let currentPositionValue = currentEle.getBoundingClientRect();

            cloneItem.classList.add("cloneItem");
            cloneItem.style.position = "absolute";
            cloneItem.style.zIndex = -1;
            cloneItem.style.opacity = "0.7";
            cloneItem.style.zIndex = 100;
            cloneItem.style.top = currentPositionValue.top + "px";
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
            // console.log(index)
        },
        mouseUp(event, index) {
            // console.log(index);
            // console.log(event)
        },
        moveMethods(ent) {
            // console.log(event)
            let event = this.currentEvent;
            let target = event.target;
            let point_x = event.offsetX;
            let point_y = event.offsetY;


            let evt = ent || window.event;
            // 获取鼠标移动的坐标位置
            let ele_left = evt.clientX - point_x;
            let ele_top = evt.clientY - point_y;
            // 将移动的新的坐标位置进行赋值
            target.style.left = ele_left + "px";
            target.style.top = ele_top + "px";





















            // // var x =
            // //     (parseFloat(target.getAttribute("data-x")) || 0) +
            // //     event.dx;
            // var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.y;
            // console.log(y)
            // target.style.setProperty(
            //     "transform",
            //     "translate3d(" + 0 + "px, " + y + "px, 0)"
            // ); // 只允许Y轴拖动
            // // target.setAttribute("data-x", x);
            // target.setAttribute("data-y", y);
        },
    },
    mounted() {
        window.addEventListener("mousedown", (event) => {
            if (event.target.className.indexOf("item") !== -1) {
                this.currentEvent = event;
                this.cloneCurrentItem(event);


                window.addEventListener("mousemove", this.moveMethods);
            }
        });
        window.addEventListener("mouseup", () => {
            let cloneItem = document.querySelectorAll(".cloneItem");
            for (let i = 0; i < cloneItem.length; i++) {
                let item = cloneItem[i];
                // this.GanttWrap.removeChild(item)
            }
            window.removeEventListener("mousemove", this.moveMethods);
            this.currentEvent = null;
        });

        // let that = this;
        this.GanttWrap = this.$refs.Gantt;
        // this.$nextTick(() => {
        //     interact(".item").draggable({
        //         inertia: true,
        //         listeners: {
        //             start(event) {
        //                 let cloneItem = that.cloneCurrentItem(event);
        //                 that.cloneArr.push(cloneItem);
        //             },
        //             move(event) {
        //                 that.listenerMove(event);
        //             },
        //             end(event) {
        //                 console.log(event);
        //                 that.removeCloneItem();
        //             },
        //         },
        //     });
        // });
    },
};
</script>

<style lang="scss" scoped>
.Gantt {
    height: 100%;
    width: 100%;
    position: relative;
    li {
        width: 100%;
        height: 140px;
        border-bottom: 1px solid #333;
        position: relative;
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
        background: orange;
        position: absolute;
    }
}
</style>
