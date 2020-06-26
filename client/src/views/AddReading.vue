<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card class="elevation-12">
                <v-toolbar
                    color="primary"
                    dark
                    flat
                >
                    <v-toolbar-title>Add reading</v-toolbar-title>
                </v-toolbar>
                <v-alert
                    dense
                    v-model="addingError"
                    outlined
                    type="error"
                >{{ errorMsg }}</v-alert>
                <v-alert
                    dense
                    text
                    v-model="addingDone"
                    type="success"
                >Successfully added</v-alert>
                <v-card-text>
                    <v-form ref="inputForm">
                        <v-autocomplete
                            prepend-icon="mdi-map-marker"
                            :items="items"
                            item-text="name"
                            item-value="name"
                            label="Location"
                            :rules="locationValidation"
                            v-model="location"
                        ></v-autocomplete>
                        <v-text-field
                            label="Temperature"
                            prepend-icon="mdi-thermometer"
                            append-icon="mdi-temperature-plus"
                            type="text"
                            :rules="temperatureValidation"
                            v-model="temperature"
                        ></v-text-field>
                        <v-checkbox
                            :prepend-icon="timeIcon"
                            label="Measured now"
                            v-model="now"
                        ></v-checkbox>
                        <v-menu
                            v-model="menu"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    :disabled="now"
                                    :value="formatDate"
                                    label="Date of measurement"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="date" @input="menu = false"></v-date-picker>
                        </v-menu>
                        <!--<v-date-picker
                            v-model="date"
                            :disabled="now"
                            width="100%"
                        ></v-date-picker>-->
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        @click="addReading"
                        :disabled="adding"
                    >Add</v-btn>
                </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
      </v-container>
</template>

<script lang="ts">
import AddReading from './AddReading';
export default AddReading;
</script>

<style scoped>
</style>