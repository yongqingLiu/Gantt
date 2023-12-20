<template>
  <div class="home">
    <Gantt></Gantt>
  </div>
</template>
<script>
// @ is an alias to /src
import Gantt from '@/components/Gantt.vue'

export default {
  name: 'HomeView',
  components: {
    Gantt
  }
}
</script>
