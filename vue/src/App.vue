<template>
  <div class="menu-container">
    <button @click="$router.push('/usd')">USD Exchange Rates</button>
    <button @click="$router.push('/gbp')">GBP Exchange Rates</button>
    <button @click="$router.push('/aud')">AUD Exchange Rates</button>
  </div>
  <router-view></router-view>
</template>

<style src="./css/nav.css" scoped></style>