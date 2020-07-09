<template>
    <v-container fluid>
        <v-row dense>
            <v-col
                v-for="reading in data"
                :key="reading.location.name"
            >
                <v-card @click="openDetailView(reading.location.name)">
                    <v-toolbar
                        color="primary"
                        dark
                        flat
                    >
                        <v-toolbar-title>
                            <v-icon>mdi-map-marker</v-icon>
                            {{reading.location.name}}
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-subtitle>
                                <v-icon>mdi-thermometer</v-icon>
                                {{reading.temperature}} &deg;C
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-subtitle>
                                <v-icon>{{ timeIcon(reading.time) }}</v-icon>
                                {{reading.time}}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-card-actions>

                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
    import AreaLocationList from './AreaLocationList';
    export default AreaLocationList;
</script>

<style scoped>

</style>