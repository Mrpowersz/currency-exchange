<template>
  <div class="container">
    <p>1 EUR to USD Exchange Rate</p>
    <p v-if="latestUpdate">Last updated: {{ latestUpdate }}</p>
    <div class="table-container">
      <table v-if="paginatedRates.length">
        <thead>
          <tr>
            <th @click="sortRates('timestamp')" style="cursor: pointer;">
              Date
              <span v-if="sortColumn === 'timestamp'">
                <span v-if="sortOrder === 'asc'">&#9650;</span>
                <span v-else>&#9660;</span>
              </span>
            </th>
            <th>EUR to USD</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rate in paginatedRates" :key="rate.id">
            <td>{{ new Date(rate.timestamp).toLocaleDateString() }}</td>
            <td>{{ rate.usd }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>No exchange rates available.</p>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">&lt</button>
        <span>{{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">&gt</button>
      </div>
      <div class="summary">
        <div class="min-max-container">
          <p class="rate-info"> Minimum: {{ minRate }} USD, Maximum: {{ maxRate }} USD</p>
          <p class="rate-info"> Average: {{ avgRate }} USD </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      exchangeRates: [],
      currentPage: 1,
      itemsPerPage: 5, //10
      sortColumn: 'timestamp',
      sortOrder: 'desc',
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.exchangeRates.length / this.itemsPerPage);
    },
    paginatedRates() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.exchangeRates.slice(start, end);
    },
    latestUpdate() {
      if (this.exchangeRates.length > 0) {
        const latestTimestamp = Math.max(...this.exchangeRates.map(rate => new Date(rate.timestamp).getTime()));
        return new Date(latestTimestamp).toLocaleDateString();
      }
      return null;
    },
    minRate() {
      return Math.min(...this.exchangeRates.map(rate => rate.usd)); // Calculate the minimum USD rate
    },
    maxRate() {
      return Math.max(...this.exchangeRates.map(rate => rate.usd)); // Calculate the maximum USD rate, same for gbp, aud
    },
    avgRate() {
      const total = this.exchangeRates.reduce((sum, rate) => sum + rate.usd, 0); // Sum up the rates
      return (total / this.exchangeRates.length).toFixed(4); // Calculate the average and fix to 4 decimal places
    },
  },
  mounted() {
    this.fetchExchangeRates();
  },
  methods: {
    async fetchExchangeRates() {
      try {
        const response = await axios.get('http://localhost:3000/exchange-rates?currency=usd');
        this.exchangeRates = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    },
    sortRates(column) {
      this.sortOrder = this.sortColumn === column && this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.sortColumn = column;

      this.exchangeRates.sort((a, b) => {
        const aValue = column === 'timestamp' ? new Date(a.timestamp).getTime() : a[column];
        const bValue = column === 'timestamp' ? new Date(b.timestamp).getTime() : b[column];
        return this.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
  },
};
</script>

<style src="../css/styles.css"></style>