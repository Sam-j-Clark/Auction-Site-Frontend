
/** The auction information retrieved from the api */
type Auction = {
    auctionId: number,
    title: string,
    endDate: string,
    categoryId: number,
    sellerId: number,
    sellerFirstName: string,
    sellerLastName: string,
    highestBid: number,
    reserve: number,
    numBids: number
    description: string
}

type Category = {
    categoryId: number,
    name: string
}

type Bid = {
    bidderId: number,
    amount: number,
    firstName: string
    lastName: string,
    timestamp: string
}