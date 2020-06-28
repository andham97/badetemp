<template>
    <v-container
        class="fill-height"
        fluid
    >
        <v-row
            align="center"
            justify="center"
        >
            <v-col
                cols="12"
                sm="8"
                md="4"
            >
                <v-card class="elevation-12">
                    <v-toolbar
                        color="primary"
                        dark
                        flat
                    >
                        <v-toolbar-title>Join</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                                label="Username"
                                name="username"
                                v-model="username"
                                prepend-icon="mdi-account"
                                type="text"
                            ></v-text-field>
                            <v-text-field
                                id="password"
                                label="Password"
                                name="password"
                                v-model="password"
                                prepend-icon="mdi-lock"
                                type="password"
                            ></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn to="/signIn" color="grey lighten-3">Already a user?</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" :click="join">Sign up</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
    import Join from './Join';
    export default Join;
</script>