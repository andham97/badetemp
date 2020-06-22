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

    private GQLService = new GQLService();
    private oldDate = moment().format('YYYY-MM-DD');
    $refs!: {
        inputForm: Vue & { validate: () => boolean },
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
        const itemData = await this.GQLService.getQuery<{ locations: ILocation[] }>(`{ locations { name }}`);
        this.items = itemData.locations;
    }

    checkTemperature(value: string): boolean | string {
        if (!value || value === '') {
            return 'Required';
        }
        value = value.replace(',', '.');
        if (isNaN(Number(value))) {
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
        if (this.$refs.inputForm.validate()) {
            const reading: IWaterReadingInput = {
                temp: Number(this.temperature),
                time: this.now ? moment().format('YYYY-MM-DD[T]HH:mm:ssZZ') : moment(this.date).format('YYYY-MM-DD[T12:00:00]ZZ'),
                location: this.location,
            };
            const r = await this.GQLService.postQuery<IWaterReading>(
                `mutation($reading: WaterReadingInput) { addWaterReading(reading: $reading) { time temp location { name }} }`,
                { reading });
        }
    }
}