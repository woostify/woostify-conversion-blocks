import { useSelect } from '@wordpress/data'
import { useBlockEditContext } from '@wordpress/block-editor'

import {
	first, last, indexOf, nth,
} from 'lodash'

const useBlockContext = ( blockClientId = null ) => {
	const blockProps = useBlockEditContext()
	const clientId = blockClientId || blockProps.clientId

	const {
		getBlock,
		block,
		parentClientId,
	} = useSelect( select => {
		const { getBlock, getBlockParents } = select( 'core/block-editor' )
		return {
			getBlock,
			block: getBlock( clientId ),
			parentClientId: last( getBlockParents( clientId ) ),
		}
	}, [] )

	const hasParent = parentClientId && parentClientId !== clientId
	const parent = hasParent ? getBlock( parentClientId ) : null

	if ( ! hasParent ) {
		return {
			numChildBlocks: block?.innerBlocks?.length,
			hasChildBlocks: !! block?.innerBlocks?.length,
			childBlocks: block?.innerBlocks,
		}
	}

	const index = hasParent ? indexOf( parent?.innerBlocks, block ) : -1
	const isLastBlock = hasParent ? last( parent?.innerBlocks )?.clientId === clientId : false

	return {
		blockIndex: index,
		parentBlock: parent,
		isFirstBlock: hasParent ? first( parent?.innerBlocks )?.clientId === clientId : false,
		isLastBlock,
		isOnlyBlock: hasParent ? ( parent?.innerBlocks?.length <= 1 ) : false,
		adjacentBlock: hasParent ? nth( parent?.innerBlocks, ! isLastBlock ? index + 1 : index - 1 ) : null,
		adjacentBlockIndex: hasParent ? ( ! isLastBlock ? index + 1 : index - 1 ) : -1,
		adjacentBlocks: parent?.innerBlocks || [],
		numChildBlocks: block?.innerBlocks?.length,
		hasChildBlocks: !! block?.innerBlocks?.length,
		childBlocks: block?.innerBlocks,
	}
}

export default useBlockContext;
