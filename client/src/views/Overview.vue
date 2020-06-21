<template>
    <v-container>
      <v-row>
        <v-col>
            <highcharts ref="chart" :options="chartOptions" />
        </v-col>
      </v-row>
    </v-container>
</template>

<script lang="ts">
import Overview from './Overview';
export default Overview;
</script>

<style>
</style>