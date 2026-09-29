import { CalendarDays, Info, ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from '@/components/test/bubble';
import { Marker, MarkerContent, MarkerIcon } from '@/components/test/marker';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from '@/components/test/message';
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoiceLabel,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from '@/components/test/questionnaire';
import { Icon, ScreenContainer, SectionTitle, showToast, Text } from '@/components/ui';

function MarkersDemo() {
  return (
    <View className="gap-3">
      <Marker>
        <MarkerIcon>
          <Icon as={Info} className="text-muted-foreground size-4" />
        </MarkerIcon>
        <MarkerContent>
          <Text>Alex joined the conversation</Text>
        </MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerIcon>
          <Icon as={CalendarDays} className="text-muted-foreground size-4" />
        </MarkerIcon>
        <MarkerContent>
          <Text>Today</Text>
        </MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <Icon as={ShieldCheck} className="text-muted-foreground size-4" />
        </MarkerIcon>
        <MarkerContent>
          <Text>Messages are end-to-end encrypted</Text>
        </MarkerContent>
      </Marker>
    </View>
  );
}

function BubblesDemo() {
  return (
    <BubbleGroup>
      <Bubble>
        <BubbleContent>
          <Text>Default — painted with the primary color.</Text>
        </BubbleContent>
      </Bubble>
      <Bubble variant="secondary">
        <BubbleContent>
          <Text>Secondary surface bubble.</Text>
        </BubbleContent>
      </Bubble>
      <Bubble variant="muted">
        <BubbleContent>
          <Text>Muted bubble for quiet replies.</Text>
        </BubbleContent>
      </Bubble>
      <Bubble variant="tinted">
        <BubbleContent>
          <Text>Tinted with the active accent palette.</Text>
        </BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent>
          <Text>Outline bubble with a border.</Text>
        </BubbleContent>
      </Bubble>
      <Bubble variant="destructive">
        <BubbleContent>
          <Text>Something went wrong here.</Text>
        </BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>
          <Text>Ghost bubble — plain text, no chrome.</Text>
        </BubbleContent>
      </Bubble>
    </BubbleGroup>
  );
}

function ChatDemo() {
  return (
    <View className="border-border bg-card gap-4 rounded-xl border p-4">
      <Marker variant="separator">
        <MarkerContent>
          <Text>Today</Text>
        </MarkerContent>
      </Marker>
      <MessageGroup>
        <Message>
          <MessageAvatar>
            <Text>AL</Text>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>
              <Text>Alex · 09:41</Text>
            </MessageHeader>
            <Bubble variant="muted">
              <BubbleContent>
                <Text>Hey! Did you try the new chat components?</Text>
              </BubbleContent>
            </Bubble>
            <Bubble variant="muted" className="mb-3">
              <BubbleContent onPress={() => showToast({ title: 'Bubble pressed', variant: 'info' })}>
                <Text>Tap this bubble — it has a gooey press effect.</Text>
              </BubbleContent>
              <BubbleReactions align="start">
                <Text>🔥 2</Text>
              </BubbleReactions>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble className="mb-3">
              <BubbleContent>
                <Text>Just did — springs everywhere 👌</Text>
              </BubbleContent>
              <BubbleReactions>
                <Text>❤️</Text>
              </BubbleReactions>
            </Bubble>
            <MessageFooter>
              <Text>Read · 09:42</Text>
            </MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
    </View>
  );
}

function QuestionnaireDemo() {
  return (
    <View className="border-border bg-card rounded-xl border p-4">
      <Questionnaire
        onSubmit={answers => showToast({
          message: JSON.stringify(answers),
          title: 'Answers submitted',
          variant: 'success',
        })}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="usage" required type="radio">
          <QuestionnaireTitle>How often do you use the starter kit?</QuestionnaireTitle>
          <QuestionnaireDescription>Pick the option that fits best.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="daily">
              <Text>Every day</Text>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="weekly">
              <Text>A few times a week</Text>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="rarely">
              <Text>Rarely</Text>
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireItem name="features" type="checkbox">
          <QuestionnaireTitle>Which features do you rely on?</QuestionnaireTitle>
          <QuestionnaireDescription>Select all that apply — or skip.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="theming">
              <QuestionnaireChoiceLabel>Theming</QuestionnaireChoiceLabel>
              <QuestionnaireChoiceDescription>Dark mode + accent palettes</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="animations">
              <QuestionnaireChoiceLabel>Animations</QuestionnaireChoiceLabel>
              <QuestionnaireChoiceDescription>Reanimated spring presets</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="navigation">
              <QuestionnaireChoiceLabel>Navigation</QuestionnaireChoiceLabel>
              <QuestionnaireChoiceDescription>Drawer, tabs and stacks</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireItem name="feedback" required type="input">
          <QuestionnaireTitle>Anything we should improve?</QuestionnaireTitle>
          <QuestionnaireDescription>A sentence or two is plenty.</QuestionnaireDescription>
          <QuestionnaireInput placeholder="Type your feedback…" />
        </QuestionnaireItem>
        <QuestionnaireError />
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          <QuestionnaireNext />
          <QuestionnaireSubmit />
        </QuestionnaireActions>
      </Questionnaire>
    </View>
  );
}

export function TestScreen() {
  return (
    <ScreenContainer>
      <Text variant="h2">Test Screen</Text>
      <SectionTitle title="Marker" />
      <MarkersDemo />
      <SectionTitle title="Bubble" />
      <BubblesDemo />
      <SectionTitle title="Message" />
      <ChatDemo />
      <SectionTitle title="Questionnaire" />
      <QuestionnaireDemo />
    </ScreenContainer>
  );
}
