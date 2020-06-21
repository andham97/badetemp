<template>
    <span>
        <v-navigation-drawer app v-model="drawer" class="blue darken-2" dark disable-resize-watcher>
            <v-list>
                <template v-for="(item, index) in items">
                    <v-list-item :key="index">
                        <v-list-item-content>
                            <v-btn class="app-navigation-link" text :to="item.path">{{item.name}}</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar app color="blue darken-4" dark>
            <v-app-bar-nav-icon class="hidden-md-and-up" @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-spacer class="hidden-md-and-up"></v-spacer>
            <router-link to="/">
                <v-toolbar-title id="app-title">{{appTitle}}</v-toolbar-title>
            </router-link>
            <!--<router-link v-for="(route, index) in items" :key="index" :to="{path: route.path}">
                <v-btn text class="hidden-sm-and-down">{{route.title}}</v-btn>
            </router-link>-->
            <v-btn v-for="(route, index) in items" :key="index" text class="hidden-sm-and-down" :to="route.path">{{route.name}}</v-btn>
        </v-app-bar>
    </span>
</template>

<script lang="ts">
import AppNavigation from './AppNavigation';
export default AppNavigation;
</script>

<style scoped>
a {
    text-decoration: none;
}

.app-navigation-link {
    color: white;
    text-decoration: none;
}

#app-title {
    color: white;
    text-decoration: none;
}
</style>