import axios from "axios";
import MockAdapter from 'axios-mock-adapter';
import bugs, { addBug, bugAdded, getUnresolvedBugs, resolveBug, loadBugs, assignBugToUser } from "../bugs"
import { apiCallBegan } from "../api";
import configureStore from "../configureStore";

describe("bugsSlice", () => {
    // describe("action creators", () => {
    //     it("addBug", () => {
    //         const bug = { description: 'a' }
    //         const result = addBug(bug);
    //         const expected = {
    //             type: apiCallBegan.type,
    //             payload: {
    //                 url: "/bugs",
    //                 method: "post",
    //                 data: bug,
    //                 onSuccess: bugAdded.type
    //             }
    //         }
    //         expect(result).toEqual(expected);
    //     })
    // })
    let fakeAxios;
    let store;
    //Initialize store and fake objects.
    beforeEach(() => {
        fakeAxios = new MockAdapter(axios);
        store = configureStore();
    });

    const bugsSlice = () => store.getState().entities.bugs;
    const createState = () => ({
        entities: {
            bugs: {
                list: []
            }
        }
    });

    it("should assign user to bug if it is saved to the server", async() => {
        const mockUserId = 1;
        fakeAxios.onPost("/bugs").reply(200, {id:1}); //Add but to fake adapter.
        fakeAxios.onPatch("/bugs/1").reply(200, { id:1, userId: mockUserId }); //Update mock bug to assign user.

        await store.dispatch(addBug({}));
        await store.dispatch(assignBugToUser(1, mockUserId));

        expect(bugsSlice().list[0].userId).toBe(mockUserId);
    });

    it("should mark the bug as resolved if its saved to the server.", async () => {
        fakeAxios.onPatch("/bugs/1").reply(200, { id:1, resolved: true });
        fakeAxios.onPost("/bugs").reply(200, {id:1});

        await store.dispatch(addBug({}));
        await store.dispatch(resolveBug(1));

        expect(bugsSlice().list[0].resolved).toBe(true);
    });

    it("should NOT mark the bug as resolved if its NOT saved to the server.", async () => {
        fakeAxios.onPatch("/bugs/1").reply(500);
        fakeAxios.onPost("/bugs").reply(200, {id:1});

        await store.dispatch(addBug({}));
        await store.dispatch(resolveBug(1));

        expect(bugsSlice().list[0].resolved).not.toBe(true);
    });

    it("should add the bug to the store if it is saved to the server.", async () => {
        //Arrange
        const bug = { description: 'a' };
        const savedBug = {...bug, id:1};
        fakeAxios.onPost('/bugs').reply(200, savedBug);
        
        //Act
        await store.dispatch(addBug(bug));

        //Assert
        expect(bugsSlice().list).toContainEqual(savedBug);
    });

    it("should not add the bug to the store if it is not saved to the server.", async () => {
        //Arrange
        const bug = { description: 'a' };
        const savedBug = {...bug, id:1};
        fakeAxios.onPost('/bugs').reply(500);
        
        //Act
        await store.dispatch(addBug(bug));

        //Assert
        expect(bugsSlice().list).toHaveLength(0);
    });

    describe("selectors", () => {
        it("getUnresolvedBugs", () => {
            const state = createState();
            state.entities.bugs.list = [{id: 1, resolved:true}, {id: 2}, {id: 3}]

            const result = getUnresolvedBugs(state);

            expect(result).toHaveLength(2);
        });
    });

    describe("loading bugs", () => {
        describe("if bugs exist in the cache", () => {
            it("they should not be fetched by the server again", async() => {
                fakeAxios.onGet("/bugs").reply(200, [{id:1}]);

                await store.dispatch(loadBugs());
                await store.dispatch(loadBugs());

                expect(fakeAxios.history.get.length).toBe(1);
            });
        });
        describe("if bugs DONT exist in the cache", () => {
            it("they should be fetched from the server and put in the store", async () => {
                fakeAxios.onGet("/bugs").reply(200, [{id:1}]);

                await store.dispatch(loadBugs());

                expect(bugsSlice().list).toHaveLength(1);
            });

            describe("loading indicator", () => {
                it("should be true when fetching the bugs", () => {
                    //fakeAxios.onGet("/bugs").reply(200, [{id:1}]);
                    fakeAxios.onGet("/bugs").reply(() => {
                        expect(bugsSlice().loading).toBe(true);
                        return [200, [{id:1}]];
                    });

                    store.dispatch(loadBugs());

                });
                it("should be false when bugs are fetched", async () => {
                    fakeAxios.onGet("/bugs").reply(200, [{id:1}]);
                    // fakeAxios.onGet("/bugs").reply(() => {
                    //     return [200, [{id:1}]];
                    // });

                    await store.dispatch(loadBugs());

                    expect(bugsSlice().loading).toBe(false);
                });
                it("should be false when server returns an error", async () => {
                    fakeAxios.onGet("/bugs").reply(500);

                    await store.dispatch(loadBugs());

                    expect(bugsSlice().loading).toBe(false);
                });
            });
        }); 
    });
    describe("assign bug to user", () => {


    });
    
});

