function getFutureDates(){

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const oneHourLater = currentTimestamp + 3600; // 3600 seconds in one hour
    const oneDayLater = currentTimestamp + 86400; // 86400 seconds in one day
    const twoDaysLater = currentTimestamp + 172800; // 172800 seconds in two days
    const threeDaysLater = currentTimestamp + 259200; // 259200 seconds in three days
    const fourDaysLater = currentTimestamp + 345600; // 345600 seconds in four days
    const fiveDaysLater = currentTimestamp + 432000; // 432000 seconds in five days
    const oneWeekLater = currentTimestamp + 604800; // 604800 seconds in one week


    console.log(`One hour later timestamp: ${oneHourLater}`);
    console.log(`One day later timestamp: ${oneDayLater}`);
    console.log(`Two days later timestamp: ${twoDaysLater}`);
    console.log(`Three days later timestamp: ${threeDaysLater}`);
    console.log(`Four days later timestamp: ${fourDaysLater}`);
    console.log(`Five days later timestamp: ${fiveDaysLater}`);
    console.log(`One week later timestamp: ${oneWeekLater}`);
}

getFutureDates();