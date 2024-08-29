import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import {ethers} from 'ethers'

const Proposals = ({ votedProposals, provider, dao, proposals, quorum, setIsLoading }) => {

  const voteHandler = async (id) => {
    try {
      const signer = await provider.getSigner()
      const transaction = await dao.connect(signer).vote(id)
      await transaction.wait()
    } catch {
      window.alert('User rejected or transaction reverted')
    }

    setIsLoading(true)
  }

  const downvoteHandler = async (id) => {
    try {
      const signer = await provider.getSigner()
      const transaction = await dao.connect(signer).downvote(id)
      await transaction.wait()
    } catch {
      window.alert('User rejected or transaction reverted')
    }

    setIsLoading(true)
  }

  const finalizeHandler = async (id) => {
    try {
      const signer = await provider.getSigner()
      const transaction = await dao.connect(signer).finalizeProposal(id)
      await transaction.wait()
    } catch {
      window.alert('User rejected or transaction reverted')
    }

    setIsLoading(true)
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Proposal Name</th>
          <th>Proposal Description</th>
          <th>Recipient Address</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Total Votes</th>
          <th>Cast Vote</th>
          <th>Finalize</th>
        </tr>
      </thead>
      <tbody>
        {proposals.map((proposal, index) => (
          <tr key={index}>
            <td>{proposal.id.toString()}</td>
            <td>{proposal.name}</td>
            <td>{proposal.description}</td>
            <td>{proposal.recipient}</td>
            <td>{ethers.utils.formatUnits(proposal.amount, "ether")} ETH</td>
            <td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
            <td>{proposal.votes.toString()}</td>
            <td>
              {!proposal.finalized && !votedProposals.has(proposal.id) && (
                <>
                  <Button
                    variant="primary m-1"
                    style={{ width: '100%' }}
                    onClick={() => voteHandler(proposal.id)}
                  >
                    Vote
                  </Button>
                  <Button
                      variant="danger m-1"
                      style={{ width: '100%' }}
                      onClick={() => downvoteHandler(proposal.id)}
                  >
                    Downvote
                  </Button>
                </>
              )}
            </td>
            <td>
              {!proposal.finalized && proposal.votes > quorum && (
                <Button
                  variant="primary"
                  style={{ width: '100%' }}
                  onClick={() => finalizeHandler(proposal.id)}
                >
                  Finalize
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default Proposals;
