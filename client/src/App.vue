<template>
    <v-app>
        <app-navigation></app-navigation>
        <v-main transition="slide-x-transition">
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import App from './App';
export default App;
</script>

<style>

</style>
