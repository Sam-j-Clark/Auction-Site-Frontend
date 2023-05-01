import useStore from "../store";

const daysTillClose = (endDateString: string): string => {
    const endDate: Date = new Date(endDateString);
    const currentDateTime: Date = new Date();
    // Difference in time in milliseconds
    const differenceInTime: number = endDate.getTime() - currentDateTime.getTime()

    const oneHour: number = 1000 * 3600
    const oneDay: number = oneHour * 24
    const oneWeek: number = oneDay * 7

    if (differenceInTime < 0) {
        return 'Closed'
    }

    if (differenceInTime > oneWeek) {
        return `Closes on ${endDate.toDateString()}`
    }
    if (differenceInTime > (oneDay * 2)) {
        return `Closes in ${differenceInTime / oneDay} days`
    }
    if (differenceInTime > oneHour) {
        return `Closes in ${differenceInTime/ oneHour} hours`
    }
    return `Closes at ${endDate.toTimeString()}`
}

const categoryName = (categoryId: number, categories: Array<Category>): string => {
    const category: any = categories.find(category => category.categoryId === categoryId);
    return category != null ? category.name : "";
}

const useCategory = (categoryId: number) => {
    const categories = useStore(state => state.categories);
    console.log(categories)
    const category: Category | undefined = categories.find(category => category.categoryId === categoryId);
    return category;
}

export { daysTillClose, categoryName, useCategory }