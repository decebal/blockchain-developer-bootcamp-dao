import {useEffect, useState} from 'react'
import {Container} from 'react-bootstrap'
import {ethers} from 'ethers'

// Components
import Navigation from './Navigation';
import Create from './Create';
import Proposals from './Proposals';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
import DAO_ABI from '../abis/DAO.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
    const [provider, setProvider] = useState(null)
    const [dao, setDao] = useState(null)
    const [treasuryBalance, setTreasuryBalance] = useState(0)

    const [account, setAccount] = useState(null)

    const [proposals, setProposals] = useState(null)
    const [quorum, setQuorum] = useState(null)
    const [votedProposals, setVotedProposals] = useState(new Set([]))
    const [proposalBalances, setProposalBalances] = useState(new Map([]))

    const [isLoading, setIsLoading] = useState(true)

    const loadBlockchainData = async () => {
        // Initiate provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)

        // Initiate contracts
        const dao = new ethers.Contract(config[31337].dao.address, DAO_ABI, provider)
        setDao(dao)

        // Fetch treasury balance
        let treasuryBalance = await provider.getBalance(dao.address)
        treasuryBalance = ethers.utils.formatUnits(treasuryBalance, 18)
        setTreasuryBalance(treasuryBalance)

        // Fetch accounts
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)

        // Fetch proposals count
        const count = await dao.proposalCount()
        const items = []

        // Fetch voted Proposals
        const votedProposals = new Set([])

        // Fetch proposal Recipient Balances
        const proposalBalances = new Map([])

        for (let i = 0; i < count; i++) {
            const proposal = await dao.proposals(i + 1)
            const id = i + 1
            items.push({...proposal, id})

            try {
                const voted = await dao.votes(account, id)
                if (voted) {
                    votedProposals.add(id)
                }
            } catch (e) {
                console.log(e)
            }

            try {
                if (!proposalBalances.has(proposal.recipient)) {
                    proposalBalances.set(
                        proposal.recipient,
                        await provider.getBalance(proposal.recipient)
                    )
                }
            } catch (e) {
                console.log(e)
            }
        }

        setProposals(items)
        setVotedProposals(votedProposals)
        setProposalBalances(proposalBalances)

        // Fetch quorum
        const quorum = await dao.quorum()
        setQuorum(ethers.utils.formatUnits(quorum, 0))

        setIsLoading(false)
    }

    useEffect(() => {
        if (isLoading) {
            loadBlockchainData()
        }
    }, [isLoading]);

    return (
        <Container>
            <Navigation account={account}/>

            <h1 className='my-4 text-center'>Welcome to our DAO!</h1>

            {isLoading ? (
                <Loading/>
            ) : (
                <>
                    <Create
                        provider={provider}
                        dao={dao}
                        setIsLoading={setIsLoading}
                    />

                    <hr/>

                    <div className='text-center'><strong>Treasury Balance:</strong> {treasuryBalance} ETH</div>
                    <div className='text-center'><strong>Quorum Needed:</strong> {quorum} votes</div>

                    <hr/>

                    <Proposals
                        provider={provider}
                        dao={dao}
                        proposals={proposals}
                        proposalBalances={proposalBalances}
                        votedProposals={votedProposals}
                        quorum={quorum}
                        setIsLoading={setIsLoading}
                    />
                </>
            )}
        </Container>
    )
}

export default App;
