<template>
    <v-container>
        <v-row>
            <v-col>
                <v-autocomplete
                    prepend-icon="mdi-map-marker"
                    :items="areas"
                    item-text="area"
                    item-value="id"
                    label="Area"
                    v-model="selectedArea"
                ></v-autocomplete>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <AreaChartComponent :area="selectedArea" />
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