import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-color';

type StackSegment = {
  value: number;
  color: string;
};

type Project = {
  project: string;
  hours: number;
  color: string;
  stacks?: StackSegment[];
};

type ProjectsAllocationListProps = {
  data: Project[];
  totalHours: number;
};

export function ProjectsAllocationList({
  data,
  totalHours,
}: ProjectsAllocationListProps) {
  const { background } = useThemeColors();

  return (
    <View className="gap-3">
      {data.map((project) => {
        const percent
          = totalHours === 0 ? 0 : (project.hours / totalHours) * 100;

        if (project.stacks) {
          return (
            <View key={project.project} className="gap-2">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 flex-row items-center gap-3">
                  <View
                    className="size-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <Text className="flex-1 text-sm font-medium">
                    {project.project}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  {project.stacks.map(stack => (
                    <View key={`${project.project}-stack-${stack.color}`} className="flex-row items-center gap-1">
                      <View
                        className="size-2 rounded-full"
                        style={{ backgroundColor: stack.color }}
                      />
                      <Text variant="caption" className="text-muted-foreground">
                        {stack.value}
                        h
                      </Text>
                    </View>
                  ))}
                </View>

                <Text
                  variant="caption"
                  className="w-12 text-right font-semibold"
                >
                  {percent.toFixed(0)}
                  %
                </Text>
              </View>

              <View className="h-2 flex-row overflow-hidden rounded-full" style={{ backgroundColor: background }}>
                {project.stacks.map(stack => (
                  <View
                    key={`${project.project}-bar-${stack.color}`}
                    style={{ flex: stack.value, backgroundColor: stack.color }}
                  />
                ))}
              </View>
            </View>
          );
        }

        return (
          <View key={project.project} className="gap-2">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-3">
                <View
                  className="size-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <Text className="flex-1 text-sm font-medium">
                  {project.project}
                </Text>
              </View>

              <Text
                variant="caption"
                className="text-muted-foreground"
              >
                {project.hours}
                {' '}
                h
              </Text>

              <Text
                variant="caption"
                className="w-12 text-right font-semibold"
              >
                {percent.toFixed(0)}
                %
              </Text>
            </View>

            <View className="bg-muted h-2 rounded-full">
              <View
                className="h-2 rounded-full"
                style={{
                  width: `${Math.max(percent, 4)}%`,
                  backgroundColor: project.color,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
