<template>
  <div>
    <div class="page-title">
      <h3>{{ "NewRecord" | localize }}</h3>
    </div>

    <Loader v-if="loading" />

    <p class="center" v-else-if="!categories.length">{{ "No_Categories" | localize }} <router-link to="/categories">{{ "Add_New_Category" | localize }}</router-link></p>

    <form class="form" v-else @submit.prevent="handleSubmit">
      <div class="input-field">
        <select ref="select" v-model="category">
          <option
            v-for="c in categoriesReverse"
            :key="c.id"
            :value="c.id"
          >{{ c.title }}</option>
        </select>
        <label>{{ "SelectCategory" | localize }}</label>
      </div>

      <p>
        <label>
          <input
              class="with-gap"
              name="type"
              type="radio"
              value="income"
              v-model="type"
          />
          <span>{{ "Income" | localize }}</span>
        </label>
      </p>

      <p>
        <label>
          <input
              class="with-gap"
              name="type"
              type="radio"
              value="outcome"
              v-model="type"
          />
          <span>{{ "Outcome" | localize }}</span>
        </label>
      </p>

      <div class="input-field">
        <input
            id="amount"
            type="number"
            v-model.number="amount"
            :class="{ invalid: $v.amount.$dirty && !$v.amount.minValue }"
        >
        <label for="amount">{{ "Amount" | localize }}</label>
        <span
            v-if="$v.amount.$error"
            class="helper-text invalid"
        >{{ "MinAmount" | localize }} {{ $v.amount.$params.minValue.min }} ₽</span>
      </div>

      <div class="input-field">
        <input
            id="description"
            type="text"
            v-model="description"
            :class="{ invalid: $v.description.$dirty && !$v.description.required }"
        >
        <label for="description">{{ "Description" | localize }}</label>
        <span
          v-if="$v.description.$error"
          class="helper-text invalid"
        >
            {{ "EnterDescription" | localize }}
          </span>
      </div>

      <button class="btn waves-effect waves-light" type="submit">
        {{ "Button_Create" | localize }}
        <i class="material-icons right">send</i>
      </button>
    </form>
  </div>
</template>

<script>
import { required, minValue } from "vuelidate/lib/validators"
import M from "materialize-css"
import { mapGetters } from "vuex"

export default {
  metaInfo() {
    return {
      title: this.$title("Sidebar_NewRecord")
    }
  },
  name: "record",
  data: () => ({
    loading: true,
    select: null,
    categories: [],
    category: null,
    type: "outcome",
    amount: 1,
    description: ""
  }),
  validations: {
    amount: { minValue: minValue(1) },
    description: { required }
  },
  async mounted() {
    this.categories = await this.$store.dispatch("fetchCategories")
    this.loading = false

    if (this.categories.length) {
      this.category = this.categoriesReverse[0].id
    }

    setTimeout(() => {
      this.select = M.FormSelect.init(this.$refs.select)
      M.updateTextFields()
    }, 0)
  },
  computed: {
    categoriesReverse() {
      return this.categories.slice().reverse()
    },
    ...mapGetters(["info"]),
    canCreateRecord() {
      if (this.type === "income") {
        return true
      }

      return this.info.bill >= this.amount
    }
  },
  methods: {
    async handleSubmit() {
      if (this.$v.$invalid) {
        this.$v.$touch()
        return
      }

      if (this.canCreateRecord) {
        try {
          await this.$store.dispatch("createRecord", {
            categoryId: this.category,
            amount: this.amount,
            description: this.description,
            type: this.type,
            date: new Date().toJSON()
          })
          const bill = this.type === "income"
            ? this.info.bill + this.amount
            : this.info.bill - this.amount

          await this.$store.dispatch("updateInfo", { bill })
          this.$message("RecordCreated")
          this.$v.$reset()
          this.amount = 1
          this.description = ""
        } catch (e) {
          e
        }
      } else {
        this.$message(`Недостаточно средств на счете (нужно дополнительно ${this.amount - this.info.bill}) ₽`)
        this.$message(`На вашем счете ${this.info.bill} ₽`)
      }
    }
  },
  destroyed() {
    if (this.select && this.select.destroy) {
      this.select.destroy()
    }
  }
}
</script>
