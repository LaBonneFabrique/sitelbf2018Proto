<template>
  <div class="formDate">
  <q-field
    icon="fa-calendar"
    label="Choisir la ou les dates"
  >
    <q-inline-datetime color="amber" v-model="datePickup" monday-first type="date" :month-names="moisFR" :day-names="joursFR" @change="addDate" :min="aujourdhui"/>
    <q-btn v-if="afficheBtn" color="amber" flat @click="forceAjout()">Ajouter cette sélection</q-btn>
  </q-field>
  <q-field
    icon="fa-calendar-check-o"
    label="Date(s) choisie(s)"
  >
      <div class="group">
      <q-chip v-for="(date, index) in listeDates" :key="toTimeStamp(date)" closable color="primary" @close="removeDate(index)">
        {{toDateReadable(date)}}
      </q-chip>
      </div>
  </q-field>
  </div>
</template>

<script>
import { QField, QInlineDatetime, QChip, QBtn, date } from 'quasar'
import { DAYNAMES, MONTHNAMES } from '../constants/date-fr'

const today = new Date()

export default {
  components: {
    QField,
    QInlineDatetime,
    QChip,
    QBtn
  },
  data () {
    return {
      datePickup: today,
      joursFR: DAYNAMES,
      moisFR: MONTHNAMES,
      listeDates: [],
      aujourdhui: today,
      lastDatePickup: today,
      afficheBtn: false
    }
  },
  methods: {
    removeDate: function (index) {
      this.listeDates.splice(index, 1)
      this.$emit('listeDates', this.listeDates)
    },
    addDate: function () {
      let unit = 'months'
      let diff = date.getDateDiff(this.datePickup, this.lastDatePickup, unit)
      this.lastDatePickup = this.datePickup
      if (diff !== 1 && diff !== -1) {
        this.listeDates.push(this.datePickup)
        this.$emit('listeDates', this.listeDates)
        this.afficheBtn = false
      }
      else {
        this.afficheBtn = true
      }
    },
    toTimeStamp: function (dateToTransform) {
      return date.formatDate(dateToTransform, 'X').toString() + Math.random().toString(2)
    },
    toDateReadable: function (dateToTransform) {
      return date.formatDate(dateToTransform, 'dddd DD MMM', {dayNames: DAYNAMES, monthnames: MONTHNAMES})
    },
    forceAjout: function () {
      this.lastDatePickup = this.datePickup
      this.listeDates.push(this.datePickup)
      this.afficheBtn = false
      this.$emit('listeDates', this.listeDates)
    }
  }
}
</script>

<style>
</style>
