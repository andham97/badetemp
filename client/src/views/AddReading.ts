import Vue from 'vue';
import Component from 'vue-class-component';
import moment from 'moment';
import GQLService, { ILocation, IWaterReadingInput, IWaterReading } from '@/services/GQLService';
import { Watch } from 'vue-property-decorator';

const hourNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

@Component
export default class AddReading extends Vue {
    public items: ILocation[] = [];
    public temperatureValidation: ((value: string) => boolean | string)[] = [this.checkTemperature];
    public locationValidation: ((value: string) => boolean | string)[] = [this.checkLocation];
    public temperature = '';
    public location = '';
    public date = moment().format('YYYY-MM-DD');
    public now = false;
    public menu = false;
    public timeIcon = 'mdi-clock-time-' + hourNames[Number(moment().format('hh')) - 1];
    public adding = false;
    public addingDone = false;
    public addingError = false;
    public errorMsg = '';

    private GQLService = new GQLService();
    private oldDate = moment().format('YYYY-MM-DD');
    $refs!: {
        inputForm: Vue & { validate: () => boolean, resetValidation: () => void },
    }

    @Watch('now')
    nowChange(value: boolean) {
        this.now = value;
        if (this.now) {
            this.oldDate = this.date;
            this.date = moment().format('YYYY-MM-DD');
        }
        else {
            this.date = this.oldDate;
        }
    }

    get formatDate(): string {
        return this.date ? moment(this.date).format('D[.] MMMM YYYY') : '';
    }

    async beforeMount() {
        const itemData = await this.GQLService.getQuery<{ locations: ILocation[] }>(`{ locations { id name } }`);
        this.items = itemData.data.locations;
    }

    checkTemperature(value: string): boolean | string {
        if (!value || value === '') {
            return 'Required';
        }
        if (isNaN(Number(value.replace(',', '.')))) {
            return 'Not a valid number';
        }
        return true;
    }

    checkLocation(value: string): boolean | string {
        if (!value || value === '') {
            return 'Required';
        }
        if (this.items.filter(location => location.name === value).length === 0) {
            return 'Specify existing location';
        }
        return true;
    }

    async addReading() {
        this.addingError = false;
        this.errorMsg = '';
        if (this.$refs.inputForm.validate()) {
            this.adding = true;
            const reading: IWaterReadingInput = {
                temperature: Number(this.temperature.replace(',', '.')),
                time: this.now ? moment().format() : moment(this.date).hours(12).minutes(0).seconds(0).format(),
                location: this.items.find(l => l.name === this.location)?.id,
            };
            const r = await this.GQLService.postQuery<IWaterReading>(
                `mutation($reading: WaterReadingInput) { addWaterReading(reading: $reading) { time temperature location { id name } } }`,
                { reading });
            if (this.GQLService.hasError(r)) {
                this.adding = false;
                this.addingError = true;
                this.errorMsg = r.errors?.[0].message;
                return;
            }
            this.location = '';
            this.temperature = '';
            this.$refs.inputForm.resetValidation();
            this.adding = false;
            this.addingDone = true;
            setTimeout(() => {
                this.addingDone = false;
            }, 3000);
        }
    }
}