import create from "zustand"

//---------------------------------------------------- Stores ----------------------------------------------------------

/** The elements stored in the persisted local storage containing the currently logged-in user or null */
interface StoredState {
    user: User | null;
    setUser: (user: User | null) => void;
    categories: Array<Category>;
    setCategories: (categories: Array<Category>) => void;
}

/** Gets the element with the given key from the local storage */
const getLocalUserStorage = (key: string): User | null => JSON.parse(window.localStorage.getItem(key) as string);

/** Sets the UserState in the local storage */
const setLocalUserStorage = (key: string, value: User | null) => window.localStorage.setItem(key, JSON.stringify(value));

/** Gets the element with the given key from the local storage */
const getLocalCategoryStorage = (key: string): Array<Category> => JSON.parse(window.localStorage.getItem(key) as string);

/** Sets the UserState in the local storage */
const setLocalCategoryStorage = (key: string, value: Array<Category>) => window.localStorage.setItem(key, JSON.stringify(value));


/** Creates the useStore hook used for global access to user information */
const useStore = create<StoredState>((set) => ({
    user: getLocalUserStorage('user') || null,
    setUser: (user: User | null) => set(() => {
        setLocalUserStorage('user', user)
        return {user: user}
    }),
    categories: getLocalCategoryStorage('categories') || [],
    setCategories: (categories: Array<Category>) => set(() => {
        setLocalCategoryStorage('categories', categories)
        return {categories: categories}
    })
}));




//---------------------------------------------------- Exports ---------------------------------------------------------


/** Export the stores for global access */
export default useStore;