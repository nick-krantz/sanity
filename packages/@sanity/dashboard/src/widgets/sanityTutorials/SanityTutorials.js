import React from 'react'
import PropTypes from 'prop-types'
import {Flex, Grid, Stack, Heading, Container, Card, Text, Box, Button} from '@sanity/ui'
import Tutorial from './Tutorial'
import dataAdapter from './dataAdapter'

const FeedItem = ({feedItem}) => {
  // Check to see if the feed item has the content needed to render an item with a link and poster image
  const isEmpty =
    !feedItem.title || (!feedItem.guideOrTutorial && !feedItem.externalLink && !feedItem.feedItems)

  if (isEmpty) {
    return null
  }
  const subtitle = feedItem.description
  const {guideOrTutorial = {}} = feedItem
  return (
    <Tutorial
      title={feedItem.title}
      href={createUrl(guideOrTutorial.slug, guideOrTutorial._type) || feedItem.externalLink}
      presenterSubtitle={subtitle}
      showPlayIcon={feedItem.hasVideo}
      posterURL={urlBuilder.image(feedItem.poster).height(360).url()}
    />
  )
}

const {urlBuilder, getFeed} = dataAdapter

function createUrl(slug, type) {
  if (type === 'tutorial') {
    return `https://www.sanity.io/docs/tutorials/${slug.current}`
  } else if (type === 'guide') {
    return `https://www.sanity.io/docs/guides/${slug.current}`
  }
  return false
}

class SanityTutorials extends React.Component {
  static propTypes = {
    templateRepoId: PropTypes.string,
  }

  static defaultProps = {
    templateRepoId: null,
  }

  state = {
    feedItems: [],
  }

  componentDidMount() {
    const {templateRepoId} = this.props
    this.subscription = getFeed(templateRepoId).subscribe((response) => {
      this.setState({
        title: response.title,
        feedItems: response.items,
      })
    })
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  render() {
    const {title = 'Learn about Sanity', feedItems} = this.state
    const {templateRepoId} = this.props

    // Filter out items and sections for layout purposes
    const sections = feedItems.filter((i) => i._type === 'feedSection')
    const items = feedItems.filter((i) => i._type === 'feedItem')

    const columns = (length) => (length < 4 ? [1, 2, 3] : [1, 2, 3, 4])

    return (
      <Container width={4}>
        <Stack space={6} paddingBottom={4}>
          <Card tone="primary" padding={4} radius={2} border marginTop={4}>
            <Flex direction={['column', 'column', 'row']}>
              <Stack space={4} flex={1} paddingRight={[0, 0, 4]}>
                <Heading>Getting started Guide</Heading>
                <Text>
                  It’s time to learn how to build schemas, create content and connect it with other
                  applications.
                </Text>
              </Stack>
              <Flex paddingTop={[4, 4, 0]} align="center">
                <Stack flex={1}>
                  <Button
                    paddingY={3}
                    paddingX={5}
                    tone="primary"
                    as="a"
                    href={`https://www.sanity.io/docs?ref=dashboard-${templateRepoId || 'plugin'}`}
                    text="Go go docs"
                  />
                </Stack>
              </Flex>
            </Flex>
          </Card>
          {sections &&
            sections?.length > 0 &&
            sections.map((section) => {
              return (
                section?.sectionItems && (
                  <Stack space={4} key={section._id}>
                    <Heading>{section.title}</Heading>
                    <Grid as="ul" columns={columns(section?.sectionItems?.length)} gap={4}>
                      {section?.sectionItems.map((item) => (
                        <Flex as="li" key={item._id}>
                          <FeedItem feedItem={item} />
                        </Flex>
                      ))}
                    </Grid>
                  </Stack>
                )
              )
            })}
          {items && items.length > 0 && (
            <Stack space={4}>
              <Heading>{title}</Heading>
              <Grid as="ul" columns={columns(items?.length)} gap={4}>
                {items.map((feedItem) => (
                  <Flex as="li" key={feedItem.id}>
                    <FeedItem feedItem={feedItem} />
                  </Flex>
                ))}
              </Grid>
            </Stack>
          )}
        </Stack>
      </Container>
    )
  }
}

export default SanityTutorials
