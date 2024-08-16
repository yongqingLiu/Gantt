<template>
    <div id="app">
        <!-- <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view /> -->
        <HelloWorld></HelloWorld>
        <!-- <Gantt></Gantt> -->
    </div>
</template>
<script>
import HelloWorld from '@/components/HelloWorld.vue';
// import Gantt from "@/components/Gantt.vue";
export default {
    components: {
        HelloWorld,
        // Gantt,
    },
};
</script>
<style lang="scss">
html,
body,
#app {
  height: 100%;
  width: 100%;
}
* {
    margin: 0;
    padding: 0;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
li {
    list-style: none;
}
nav {
    padding: 30px;

    a {
        font-weight: bold;
        color: #2c3e50;

        &.router-link-exact-active {
            color: #42b983;
        }
    }
}

</style>
