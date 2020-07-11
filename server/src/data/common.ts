import moment from "moment";

export const getStartTime = (): string => moment()
    .milliseconds(0)
    .seconds(0)
    .minutes(0)
    .hours(0)
    .date(1)
    .month(3)
    .format();