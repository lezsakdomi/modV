<template>
  <div class="columns is-multiline">
    <div class="column is-12">
      Devices:
    </div>

    <div class="column is-12" v-for="(device, deviceName) in devices" :key="device">
      {{ deviceName }}
    </div>

    <div class="column is-12">
      Assignments:
    </div>

    <div class="column is-12" v-for="assignment in assignments" :key="assignment">
      {{ assignment }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'midiAssignmentPluginControlPanel',
  computed: {
    ...mapGetters('midiAssignment', [
      'assignments',
      'devices',
    ]),
  },
};
</script>

<style lang="scss">
</style>
